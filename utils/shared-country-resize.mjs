/**
 * One ResizeObserver for every country/station title in this document.
 * A fallback attaches one window listener when ResizeObserver is unavailable.
 * A callback may be subscribed more than once to a target and is cleaned up
 * with the returned disposer; no per-card window listeners are created.
 */
const subscribers = new Map();
let observer;
let fallbackListening = false;

const notify = element => {
  const callbacks = subscribers.get(element);
  if (!callbacks) return;
  for (const callback of callbacks.keys()) callback();
};

const onWindowResize = () => {
  for (const element of subscribers.keys()) notify(element);
};

export function observeCountrySize(element, callback) {
  if (!element || typeof callback !== 'function' || typeof window === 'undefined') return () => {};
  let callbacks = subscribers.get(element);
  if (!callbacks) {
    callbacks = new Map();
    subscribers.set(element, callbacks);
    if (typeof ResizeObserver !== 'undefined') {
      if (!observer) observer = new ResizeObserver(entries => {
        for (const entry of entries) notify(entry.target);
      });
      observer.observe(element);
    } else if (!fallbackListening) {
      window.addEventListener('resize', onWindowResize, { passive: true });
      fallbackListening = true;
    }
  }
  callbacks.set(callback, (callbacks.get(callback) || 0) + 1);

  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    const existing = subscribers.get(element);
    if (!existing) return;
    const count = existing.get(callback);
    if (!count) return;
    if (count > 1) existing.set(callback, count - 1);
    else existing.delete(callback);
    if (existing.size) return;
    subscribers.delete(element);
    observer?.unobserve(element);
    if (!subscribers.size) {
      observer?.disconnect();
      observer = undefined;
      if (fallbackListening) {
        window.removeEventListener('resize', onWindowResize);
        fallbackListening = false;
      }
    }
  };
}
