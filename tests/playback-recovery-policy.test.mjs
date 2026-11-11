import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { MAX_STREAM_ATTEMPTS, buildPlaybackSources } from '../utils/radio-source-plan.mjs';
import {
  isCurrentMediaPlaying, playbackWatchdogAction, nextRecoverySourceIndex,
  STREAM_STALL_TIMEOUT_MS, STABLE_PLAYBACK_WINDOW_MS,
  CONNECT_DEADLINE_MS, CONNECTING_SLOW_AFTER_MS, STALL_PROBE_MAX_EXTENSIONS,
  connectDeadlineExceeded, canExtendStallProbe,
} from '../utils/playback-recovery-policy.mjs';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
const stalled = overrides => ({
  waiting: true, playing: false, userPaused: false, online: true,
  autoReconnect: true, attemptCount: 1, sourceCount: 1, ...overrides,
});

test('queued playing events cannot revive interrupted or explicitly paused media', () => {
  const active = { media: { paused: false, ended: false }, userPaused: false,
    hasPlayableSource: true, activeSource: 'source', station: { url: '/a/b/c' } };
  assert.equal(isCurrentMediaPlaying(active), true);
  for (const change of [{ media: null }, { media: { paused: true } },
    { media: { paused: false, ended: true } }, { userPaused: true },
    { hasPlayableSource: false }, { activeSource: '' }, { station: null }]) {
    assert.equal(isCurrentMediaPlaying({ ...active, ...change }), false);
  }
});

test('single source and last source always have bounded fallback until six attempts', () => {
  assert.equal(STREAM_STALL_TIMEOUT_MS, 10_000);
  assert.equal(MAX_STREAM_ATTEMPTS, 6);
  for (const sourceCount of [1, 2, 5]) {
    assert.equal(playbackWatchdogAction(stalled({ sourceCount, attemptCount: 1 })), 'advance');
    assert.equal(playbackWatchdogAction(stalled({ sourceCount, attemptCount: 5 })), 'advance');
    assert.equal(playbackWatchdogAction(stalled({ sourceCount, attemptCount: 6 })), 'stop');
    assert.equal(playbackWatchdogAction(stalled({ sourceCount, attemptCount: 9 })), 'stop');
    assert.equal(nextRecoverySourceIndex(sourceCount - 1, sourceCount), 0);
  }
  assert.equal(nextRecoverySourceIndex(0, 1), 0, 'retry the only station source, not another station');
  assert.equal(nextRecoverySourceIndex(0, 0), -1);
  assert.equal(playbackWatchdogAction(stalled({ sourceCount: 0 })), 'ignore');
});

test('never recover when deliberately paused, already playing, offline or no longer waiting', () => {
  for (const state of [
    { userPaused: true }, { playing: true, waiting: false }, { online: false },
    { waiting: false }, { sourceCount: -1 }, { sourceCount: 2.5 },
  ]) {
    assert.equal(playbackWatchdogAction(stalled(state)), 'ignore', JSON.stringify(state));
  }
});

test('a stale playing flag cannot suppress watchdog while loading is visible', () => {
  assert.equal(playbackWatchdogAction(stalled({ playing: true, waiting: true, attemptCount: 2 })), 'advance');
  assert.equal(playbackWatchdogAction(stalled({ playing: true, waiting: true, attemptCount: 6 })), 'stop');
  assert.equal(playbackWatchdogAction(stalled({ playing: true, waiting: false })), 'ignore');
});

test('disable auto reconnect turns silence into manual Retry state, not infinite loading', () => {
  assert.equal(playbackWatchdogAction(stalled({ autoReconnect: false })), 'stop');
  assert.equal(playbackWatchdogAction(stalled({ autoReconnect: false, sourceCount: 1 })), 'stop');
  assert.equal(playbackWatchdogAction(stalled({ autoReconnect: false, waiting: false })), 'ignore');
});

test('MP3, AAC and HLS source plans preserve ordering, no unsafe HLS proxy and six tries', () => {
  const plan = buildPlaybackSources([
    { src: 'https://audio.test/live.mp3', type: 'audio/mpeg' },
    { src: 'https://audio.test/live.aac', type: 'audio/aac' },
    { src: 'https://audio.test/live.m3u8', type: 'application/vnd.apple.mpegurl' },
  ], 'https://proxy.test/');
  assert.deepEqual(plan.map(x => x.proxied ? 'proxy' : x.type), [
    'audio/mpeg', 'proxy', 'audio/aac', 'proxy', 'application/vnd.apple.mpegurl',
  ]);
  assert.equal(plan.filter(x => x.src.includes('.m3u8')).length, 1);
  for (let i = 1; i < MAX_STREAM_ATTEMPTS; i++) {
    assert.equal(playbackWatchdogAction(stalled({ sourceCount: plan.length, attemptCount: i })), 'advance');
  }
  assert.equal(playbackWatchdogAction(stalled({ sourceCount: plan.length, attemptCount: MAX_STREAM_ATTEMPTS })), 'stop');
});

test('play() promise resolution never impersonates the browser playing event', async () => {
  const player = await read('components/player/Player.vue');
  const promiseHandler = player.split('const tryPlay = async (): Promise<void> => {')[1]?.split('const startFallbackProbe = (): void => {')[0];
  assert.ok(promiseHandler, 'play() handler exists');
  assert.match(promiseHandler, /await media\.play\(\)/);
  assert.doesNotMatch(promiseHandler, /onMediaPlaying\(\)/,
    'a resolved play promise must not create a synthetic playing event or listening time');
  assert.doesNotMatch(promiseHandler, /media\.readyState\s*>=\s*HTMLMediaElement\.HAVE_CURRENT_DATA|const hasDecodedAudio/,
    'buffered samples alone are not evidence that live playback started');
  assert.match(promiseHandler, /if \(playing\.value && !media\.paused && !media\.ended\) \{[\s\S]*?waiting\.value = false;[\s\S]*?pendingAutoPlay\.value = false;[\s\S]*?clearFallbackProbeTimer\(\);[\s\S]*?return;/,
    'a real playing event may precede promise completion and its state must be preserved');
  assert.match(promiseHandler, /pendingAutoPlay\.value = true;[\s\S]*?waiting\.value = true;[\s\S]*?startFallbackProbe\(\)/,
    'without a playing event keep bounded startup recovery active');
  const onPlaying = player.split('const onMediaPlaying = (): void => {')[1]?.split('const onMediaWaiting')[0];
  assert.match(onPlaying, /listeningDurationTracker\.start\(playback\.station\)/,
    'listening time still starts on an actual playing event');
  assert.match(onPlaying, /playing\.value = true;/);
  assert.match(onPlaying, /clearFallbackProbeTimer\(\)/);
});

test('player keeps one watchdog through loading, canplay and repeated waiting events', async () => {
  const player = await read('components/player/Player.vue');
  assert.match(player, /if \(fallbackProbeTimer \|\| userPaused\.value/);
  assert.match(player, /const version = sourceVersion;\s*fallbackProbeTimer = setTimeout/);
  assert.match(player, /if \(version !== sourceVersion\) return;[\s\S]*?const action = playbackWatchdogAction/);
  assert.match(player, /if \(pendingAutoPlay\.value\) startFallbackProbe\(\);/);
  assert.match(player, /if \(action === 'stop'\) stopPlaybackFailure\(\);\s*else advanceFallbackSource\(\);/);
  const canplay = player.split('const onMediaCanPlay = (): void => {')[1].split('const onMediaPlaying')[0];
  assert.match(canplay, /if \(userPaused\.value \|\| !pendingAutoPlay\.value\) return;/);
  assert.doesNotMatch(canplay, /clearReconnectTimer\(\)/,
    'canplay alone must never cancel the reconnect timer');
  assert.match(canplay, /clearFallbackProbeTimer\(\);\s*extensionsUsed \+= 1;\s*startFallbackProbe\(\)/,
    'canplay may only extend the stall probe by clearing and immediately re-arming it, bounded by canExtendStallProbe');
  const waiting = player.split('const onMediaWaiting = (): void => {')[1].split('const onMediaStalled')[0];
  assert.match(waiting, /pendingAutoPlay\.value = true;/);
  assert.match(waiting, /startFallbackProbe\(\);/);
  assert.match(player, /await configureHlsSource\(source, autoplay, version\);/);
  assert.match(player, /catch \(error\) \{[\s\S]*?scheduleReconnect\(\);/, 'failed HLS import/setup must not leave pending promise');
});

test('retry budget resets only after stable real playback, and timers are cancelled on pause/change/unmount', async () => {
  assert.equal(STABLE_PLAYBACK_WINDOW_MS, 30_000);
  const player = await read('components/player/Player.vue');
  const onPlaying = player.split('const onMediaPlaying = (): void => {')[1].split('const onMediaWaiting')[0];
  assert.match(onPlaying, /startStablePlaybackTimer\(\);/);
  assert.doesNotMatch(onPlaying, /attemptCount\.value = 0/, 'short successes must not replenish the retry budget');
  const stability = player.split('const startStablePlaybackTimer = (): void => {')[1].split('const tryPlay')[0];
  assert.match(stability, /version !== sourceVersion/);
  assert.match(stability, /!playing\.value \|\| waiting\.value/);
  assert.match(stability, /!media \|\| media\.paused/);
  assert.match(stability, /attemptCount\.value = 0/);
  for (const marker of ['const onMediaWaiting', 'const onMediaPause', 'const onMediaEnded', 'const onMediaError', 'onUnmounted']) {
    const after = player.split(marker)[1];
    assert.ok(after?.slice(0, marker === 'onUnmounted' ? 900 : 230).includes('clearStablePlaybackTimer()'),
      marker + ' must invalidate stability window');
  }
  const pause = player.split('const onPause = (): void => {')[1].split('const sleepRemaining')[0];
  assert.match(pause, /clearFallbackProbeTimer\(\);\s*clearStablePlaybackTimer\(\);/);
});

test('connect deadline caps a continuous connecting episode at 90s', () => {
  assert.equal(CONNECT_DEADLINE_MS, 90_000);
  assert.equal(CONNECTING_SLOW_AFTER_MS, 20_000);
  const start = 1_000_000;
  assert.equal(connectDeadlineExceeded(start, start), false);
  assert.equal(connectDeadlineExceeded(start, start + CONNECT_DEADLINE_MS - 1), false);
  assert.equal(connectDeadlineExceeded(start, start + CONNECT_DEADLINE_MS), true);
  assert.equal(connectDeadlineExceeded(start, start + CONNECT_DEADLINE_MS + 5_000), true);
  for (const invalid of [null, undefined, Number.NaN, 0, -1, '1000']) {
    assert.equal(connectDeadlineExceeded(invalid, start + CONNECT_DEADLINE_MS + 1), false, String(invalid));
  }
  assert.equal(connectDeadlineExceeded(start, Number.NaN), false);
});

test('stall probe extensions are bounded to two canplay progress signals', () => {
  assert.equal(STALL_PROBE_MAX_EXTENSIONS, 2);
  assert.equal(canExtendStallProbe(0), true);
  assert.equal(canExtendStallProbe(1), true);
  assert.equal(canExtendStallProbe(2), false);
  assert.equal(canExtendStallProbe(3), false);
  for (const invalid of [-1, 0.5, Number.NaN, '1', null, undefined]) {
    assert.equal(canExtendStallProbe(invalid), false, String(invalid));
  }
});

test('player enforces the connect deadline before the watchdog and extends probes only on canplay progress', async () => {
  const player = await read('components/player/Player.vue');
  const probe = player.split('const startFallbackProbe = (): void => {')[1]?.split('const configureNativeSource')[0];
  assert.ok(probe, 'fallback probe exists');
  const deadlineIdx = probe.indexOf('connectDeadlineExceeded(connectStartedAt.value, Date.now())');
  const watchdogIdx = probe.indexOf('playbackWatchdogAction');
  assert.ok(deadlineIdx >= 0 && watchdogIdx > deadlineIdx, 'deadline check must precede watchdog action');
  assert.match(probe, /connectDeadlineExceeded[\s\S]*?playbackFailureReason\(\{ timeout: true \}\)[\s\S]*?stopPlaybackFailure\(\)/);
  const canplay = player.split('const onMediaCanPlay = (): void => {')[1].split('const flushHlsSongMetadata')[0];
  assert.match(canplay, /fallbackProbeTimer && canExtendStallProbe\(extensionsUsed\)/);
  assert.match(canplay, /clearFallbackProbeTimer\(\);\s*extensionsUsed \+= 1;\s*startFallbackProbe\(\)/);
  const apply = player.split('const applySource = async (')[1]?.split('const advanceFallbackSource')[0];
  assert.match(apply, /extensionsUsed = 0;/);
  assert.match(apply, /startConnectClock\(\)/);
  assert.match(player, /const connectStartedAt = ref/);
  assert.match(player, /const slowConnecting = ref/);
  assert.match(player, /CONNECTING_SLOW_AFTER_MS/);
});

test('manual retry and offline/online restoration keep explicit intent and source identity', async () => {
  const player = await read('components/player/Player.vue');
  assert.match(player, /const retryCurrentSource = \(\): void => \{[\s\S]*?attemptCount\.value = 0;[\s\S]*?applySource\(activeSourceIndex\.value, true\)/);
  assert.match(player, /if \(wasOffline && !userPaused\.value\) \{\s*retryCurrentSource\(\)/);
  assert.match(player, /fallbackProbeTimer \|\| userPaused\.value \|\| !online\.value/);
  assert.doesNotMatch(player, /source: source\.src/, 'sensitive stream URL must not be logged');
  const recovery = player.split('const advanceFallbackSource = (): boolean => {')[1].split('const scheduleReconnect')[0];
  assert.doesNotMatch(recovery, /navigateStation|navigateTo/, 'recovery must not switch station');
});
