import { MAX_STREAM_ATTEMPTS, nextPlaybackIndex } from './radio-source-plan.mjs';

// A stream is not healthy merely because the manifest or metadata was loaded.
// Keep a watchdog through initial connecting and after playback begins buffering.
export const STREAM_STALL_TIMEOUT_MS = 10_000;
// Short bursts of audio must not reset the six-attempt retry budget.
export const STABLE_PLAYBACK_WINDOW_MS = 30_000;
// Overall cap for one continuous connecting episode. Single-source stations
// otherwise cycle the same source indefinitely through HLS recovery.
export const CONNECT_DEADLINE_MS = 90_000;
// After this long still connecting, surface a neutral slow-connecting hint.
export const CONNECTING_SLOW_AFTER_MS = 20_000;
// How many times a canplay progress signal may extend the current stall probe.
export const STALL_PROBE_MAX_EXTENSIONS = 2;

export function connectDeadlineExceeded(startedAt, now) {
  if (!Number.isFinite(startedAt) || !Number.isFinite(now)) return false;
  if (startedAt <= 0) return false;
  return now - startedAt >= CONNECT_DEADLINE_MS;
}

export function canExtendStallProbe(extensionsUsed) {
  return Number.isInteger(extensionsUsed) && extensionsUsed >= 0
    && extensionsUsed < STALL_PROBE_MAX_EXTENSIONS;
}

// A playing event can be queued before a system interruption pauses media.
// Do not report playback or start listening accounting for a paused element.
export function isCurrentMediaPlaying({ media, userPaused, hasPlayableSource, activeSource, station } = {}) {
  return Boolean(media && !media.paused && !media.ended && !userPaused
    && hasPlayableSource && activeSource && station);
}

export function playbackWatchdogAction({
  waiting = false,
  playing = false,
  userPaused = true,
  online = false,
  autoReconnect = false,
  attemptCount = 0,
  sourceCount = 0,
} = {}) {
  // A stale playing flag must never disable the watchdog while the UI is still
  // waiting. An actually-playing stream has waiting=false.
  if (!online || userPaused || !waiting || !Number.isInteger(sourceCount) || sourceCount < 1) {
    return 'ignore';
  }
  if (!autoReconnect || attemptCount >= MAX_STREAM_ATTEMPTS) return 'stop';
  // One source or the final source must still be retried (until budget ends).
  return 'advance';
}

export function nextRecoverySourceIndex(currentIndex, sourceCount) {
  return nextPlaybackIndex(currentIndex, sourceCount);
}
