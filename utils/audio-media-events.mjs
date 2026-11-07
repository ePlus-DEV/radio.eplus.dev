// Media event subscriptions are owned by one global Player instance.
// Attach all handlers together and return an idempotent teardown bound to
// the *same media element* even if the Vue ref later points elsewhere.
export const AUDIO_EVENT_NAMES = Object.freeze([
  'canplay', 'playing', 'waiting', 'stalled', 'pause',
  'ended', 'error', 'volumechange', 'timeupdate',
]);

export function bindAudioMediaEvents(media, handlers) {
  if (!media || typeof media.addEventListener !== 'function' ||
      typeof media.removeEventListener !== 'function') {
    throw new TypeError('Audio element with event methods required');
  }
  // Validate before attaching anything to avoid partial subscriptions.
  const entries = AUDIO_EVENT_NAMES.map(name => [name, handlers?.[name]]);
  if (entries.some(([, listener]) => typeof listener !== 'function')) {
    throw new TypeError('All audio event handlers must be functions');
  }
  for (const [name, listener] of entries) media.addEventListener(name, listener);

  let detached = false;
  return () => {
    if (detached) return;
    detached = true;
    for (const [name, listener] of entries) media.removeEventListener(name, listener);
  };
}
