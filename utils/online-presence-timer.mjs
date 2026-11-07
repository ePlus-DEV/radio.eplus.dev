/**
 * Keep foreground presence accounting accurate without waking the app every
 * second on every route. Only the visible statistics panel needs a 1s preview.
 * No timer is needed while offline, hidden, opted out or idle.
 */
export const ONLINE_PRESENCE_CHECKPOINT_MS = 5_000;
export const ONLINE_STATS_PREVIEW_MS = 1_000;

export function onlinePresenceTickInterval({ eligible = false, idle = false, statsVisible = false } = {}) {
  if (!eligible || idle) return 0;
  return statsVisible ? ONLINE_STATS_PREVIEW_MS : ONLINE_PRESENCE_CHECKPOINT_MS;
}
