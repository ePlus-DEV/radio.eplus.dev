import { MAX_STREAM_ATTEMPTS, nextPlaybackIndex } from './radio-source-plan.mjs';

// A stream is not healthy merely because the manifest or metadata was loaded.
// Keep a watchdog through initial connecting and after playback begins buffering.
export const STREAM_STALL_TIMEOUT_MS = 10_000;
// Short bursts of audio must not reset the six-attempt retry budget.
export const STABLE_PLAYBACK_WINDOW_MS = 30_000;

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
