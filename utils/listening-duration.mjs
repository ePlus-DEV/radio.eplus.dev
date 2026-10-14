import { stationIdentity } from './listening-library.mjs';

export const LISTENING_DURATION_KEY = 'radio_listening_duration_v1';
export const MAX_TRACKED_STATIONS = 100;
// A background tab can have timers suspended while native radio keeps playing.
// Guard against pathological clock gaps without truncating normal long listens.
export const MAX_LISTENING_GAP_MS = 6 * 60 * 60 * 1000;
export const emptyListeningDuration = () => ({
  totalMs: 0,
  todayKey: '',
  todayMs: 0,
  byStation: {},
});

const safeMs = value => Number.isFinite(value) ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(value))) : 0;

export function localDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseListeningDuration(raw) {
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return emptyListeningDuration();
    const entries = Object.entries(data.byStation && typeof data.byStation === 'object' ? data.byStation : {});
    const byStation = {};
    for (const [url, entry] of entries.slice(-MAX_TRACKED_STATIONS)) {
      const station = stationIdentity({ url, title: entry?.title, image: '/brand/onair-mark.svg' });
      if (!station) continue;
      byStation[url] = { title: station.title, ms: safeMs(entry?.ms) };
    }
    return {
      totalMs: safeMs(data.totalMs),
      todayKey: typeof data.todayKey === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.todayKey) ? data.todayKey : '',
      todayMs: safeMs(data.todayMs),
      byStation,
    };
  } catch { return emptyListeningDuration(); }
}

export function addListeningDuration(stats, station, durationMs, dayKey = localDayKey()) {
  const item = stationIdentity(station);
  const elapsed = safeMs(durationMs);
  if (!item || elapsed < 1) return stats;
  const byStation = { ...stats.byStation };
  const previous = byStation[item.url];
  delete byStation[item.url]; // Move recently used station to the end for bounded storage.
  byStation[item.url] = {
    title: item.title,
    ms: safeMs((previous?.ms || 0) + elapsed),
  };
  const keys = Object.keys(byStation);
  for (const oldUrl of keys.slice(0, -MAX_TRACKED_STATIONS)) delete byStation[oldUrl];
  return {
    totalMs: safeMs(stats.totalMs + elapsed),
    todayKey: dayKey,
    todayMs: safeMs((stats.todayKey === dayKey ? stats.todayMs : 0) + elapsed),
    byStation,
  };
}

// Monotonic clock: accumulate only between actual media "playing" and pause,
// waiting/stalled, ended, error or source-switch signals.
export function createListeningDurationTracker({
  now = () => performance.now(),
  onDuration,
  onReport = () => {},
  reportEveryMs = 30_000,
} = {}) {
  if (typeof onDuration !== 'function') throw new TypeError('onDuration is required');
  let active = null;
  let lastAt = 0;
  let unreportedMs = 0;

  const flush = () => {
    if (!active) return;
    const current = now();
    const elapsed = Math.max(0, Math.min(MAX_LISTENING_GAP_MS, current - lastAt));
    lastAt = current;
    if (elapsed <= 0) return;
    onDuration(active, elapsed);
    unreportedMs += elapsed;
    if (unreportedMs >= reportEveryMs) {
      onReport(active, unreportedMs);
      unreportedMs = 0;
    }
  };

  const stop = () => {
    if (!active) return;
    flush();
    if (unreportedMs >= 1000) onReport(active, unreportedMs);
    active = null;
    unreportedMs = 0;
  };

  return {
    start(station) {
      const valid = stationIdentity(station);
      if (!valid) return;
      if (active?.url === valid.url) return;
      stop();
      active = valid;
      lastAt = now();
    },
    flush,
    stop,
    // Preview accrued time without writing to storage. This is read by the
    // visible statistics dashboard each second; flush still persists every 5s.
    get pendingMs() {
      if (!active) return 0;
      return Math.max(0, Math.min(MAX_LISTENING_GAP_MS, now() - lastAt));
    },
    get activeUrl() { return active?.url || ''; },
  };
}
