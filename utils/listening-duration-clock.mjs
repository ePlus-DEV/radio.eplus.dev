/**
 * Audio listening duration is independent of foreground page presence:
 * hidden tabs can continue genuine media playback. Keep a heartbeat only while
 * a real stream is playing, and provide 1s preview only on the statistics tab.
 *
 * The existing listening-duration tracker remains responsible for clock drift,
 * sleep-gap caps, day-boundary splitting, storage and privacy/GA4 reporting.
 */
export const LISTENING_CHECKPOINT_MS = 5_000;
export const LISTENING_STATS_PREVIEW_MS = 1_000;

export function shouldResumeListeningAfterRestore({ persisted, media, trackingEnabled, playing, waiting, userPaused, streamError, hasSource, station } = {}) {
  return Boolean(persisted && media && !media.paused && !media.ended && media.readyState >= 3
    && trackingEnabled && playing && !waiting && !userPaused && !streamError && hasSource && station);
}

export function createListeningDurationClock({
  flush,
  preview,
  setIntervalFn = setInterval,
  clearIntervalFn = clearInterval,
} = {}) {
  if (typeof flush !== 'function' || typeof preview !== 'function') {
    throw new TypeError('flush and preview callbacks are required');
  }
  let intervalId = null;
  let periodMs = 0;
  let ticks = 0;
  let generation = 0;

  const stop = () => {
    generation += 1;
    if (intervalId !== null) clearIntervalFn(intervalId);
    intervalId = null;
    periodMs = 0;
    ticks = 0;
  };

  const sync = ({ playing = false, statsVisible = false } = {}) => {
    const nextPeriod = playing
      ? (statsVisible ? LISTENING_STATS_PREVIEW_MS : LISTENING_CHECKPOINT_MS)
      : 0;
    if (periodMs === nextPeriod) return;
    stop();
    if (!nextPeriod) return;

    periodMs = nextPeriod;
    const currentGeneration = generation;
    // Route changes update the visible value immediately without writing stats.
    preview();
    intervalId = setIntervalFn(() => {
      // A queued interval callback may run after pause, opt-out or mode switch.
      if (currentGeneration !== generation) return;
      ticks += 1;
      if (nextPeriod === LISTENING_CHECKPOINT_MS || ticks % 5 === 0) flush();
      // The preview is not a persisted checkpoint. Background audio is still
      // saved at 5s even when document.visibilityState is hidden.
      preview();
    }, nextPeriod);
  };

  return {
    sync,
    stop,
    get periodMs() { return periodMs; },
  };
}
