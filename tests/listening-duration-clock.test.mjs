import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  createListeningDurationClock, LISTENING_CHECKPOINT_MS, LISTENING_STATS_PREVIEW_MS,
} from '../utils/listening-duration-clock.mjs';

function harness() {
  const timers = new Map();
  const events = [];
  let nextId = 0;
  const clock = createListeningDurationClock({
    flush: () => events.push('flush'),
    preview: () => events.push('preview'),
    setIntervalFn: (callback, ms) => {
      const id = ++nextId;
      timers.set(id, { callback, ms });
      return id;
    },
    clearIntervalFn: id => timers.delete(id),
  });
  const tick = (count = 1) => {
    for (let n = 0; n < count; n++) {
      // Capture the current timer; the callback may change scheduling.
      [...timers.values()].forEach(timer => timer.callback());
    }
  };
  return { clock, timers, events, tick };
}

test('no interval before actual playback and none after pause/stream failure', () => {
  const { clock, timers, events, tick } = harness();
  clock.sync();
  assert.equal(timers.size, 0);
  clock.sync({ playing: true });
  assert.equal(clock.periodMs, LISTENING_CHECKPOINT_MS);
  assert.deepEqual([...timers.values()].map(x => x.ms), [5_000]);
  tick(2);
  assert.deepEqual(events, ['preview', 'flush', 'preview', 'flush', 'preview']);
  clock.sync({ playing: false });
  assert.equal(clock.periodMs, 0);
  assert.equal(timers.size, 0);
  tick();
  assert.equal(events.filter(x => x === 'flush').length, 2);
  clock.stop();
});

test('statistics tab previews once per second but still flushes every five seconds', () => {
  const { clock, events, timers, tick } = harness();
  clock.sync({ playing: true, statsVisible: true });
  assert.equal(clock.periodMs, LISTENING_STATS_PREVIEW_MS);
  assert.deepEqual([...timers.values()].map(x => x.ms), [1_000]);
  tick(4);
  assert.equal(events.filter(x => x === 'flush').length, 0);
  assert.equal(events.filter(x => x === 'preview').length, 5);
  tick();
  assert.equal(events.filter(x => x === 'flush').length, 1);
  assert.equal(events.filter(x => x === 'preview').length, 6);
});

test('mode switching never creates duplicate intervals and does not flush on route changes', () => {
  const { clock, timers, events, tick } = harness();
  clock.sync({ playing: true });
  const originalId = [...timers.keys()][0];
  clock.sync({ playing: true });
  assert.deepEqual([...timers.keys()], [originalId]);
  clock.sync({ playing: true, statsVisible: true });
  assert.equal(timers.size, 1);
  assert.equal(timers.has(originalId), false);
  tick(2);
  clock.sync({ playing: true });
  assert.equal(timers.size, 1);
  assert.equal(events.filter(x => x === 'flush').length, 0);
  tick();
  assert.equal(events.filter(x => x === 'flush').length, 1);
  clock.stop();
  assert.equal(timers.size, 0);
  clock.stop();
});

test('headless background playback remains eligible; privacy opt-out stops all ticks', () => {
  const { clock, timers, events, tick } = harness();
  // No visibility condition is required because media playback can continue
  // after the listener locks the phone or backgrounds the browser.
  clock.sync({ playing: true, statsVisible: false });
  tick();
  assert.equal(events.filter(x => x === 'flush').length, 1);
  clock.sync({ playing: false });
  assert.equal(timers.size, 0);
  const count = events.length;
  tick(20);
  assert.equal(events.length, count);
});

test('Player wires one duration clock to actual media lifecycle and local settings', async () => {
  const player = await readFile(new URL('../components/player/Player.vue', import.meta.url), 'utf8');
  assert.match(player, /createListeningDurationClock\(/);
  assert.match(player, /playing: Boolean\(listeningDuration\.enabled && listeningDurationTracker\.activeUrl\)/);
  assert.match(player, /statsVisible: currentRoute\.path === '\/library' && currentRoute\.hash === '#stats'/);
  assert.match(player, /listeningDurationTracker\.start\(playback\.station\);[\s\S]{0,150}syncDurationClock\(\)/);
  assert.match(player, /watch\(\(\) => \[currentRoute\.path, currentRoute\.hash\], syncDurationClock\)/);
  assert.match(player, /const stopListeningDuration = \(\) => \{\s*durationClock\.stop\(\);\s*listeningDurationTracker\.stop\(\)/);
  assert.match(player, /const resetListeningTracking = \(\)(?:: void)? => \{\s*durationClock\.stop\(\);\s*listeningDurationTracker\.discard\(\)/);
  assert.doesNotMatch(player, /durationInterval = setInterval\(/);
  assert.doesNotMatch(player, /durationTickCount/);
});

test('misconfigured clocks reject missing callbacks', () => {
  assert.throws(() => createListeningDurationClock(), TypeError);
  assert.throws(() => createListeningDurationClock({ flush() {} }), TypeError);
});
