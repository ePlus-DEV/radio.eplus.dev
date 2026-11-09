// Clock for catalog-sourced Vietnamese reference programme boundaries.
// Inactive stations must allocate ZERO periodic timers in the global player.
export function createReferenceScheduleClock({
  hasReference, onTick, intervalMs = 60_000,
  setTimer = setInterval, clearTimer = clearInterval,
}) {
  if (typeof hasReference !== 'function' || typeof onTick !== 'function')
    throw new TypeError('Reference schedule clock requires callbacks');
  let timer = null;
  const stop = () => {
    if (timer === null) return;
    clearTimer(timer);
    timer = null;
  };
  return {
    sync() {
      if (!hasReference()) { stop(); return; }
      if (timer === null) timer = setTimer(onTick, intervalMs);
    },
    stop,
  };
}
