// Lazy-load hls.js only when an HLS source is selected. A rejected dynamic
// import must not poison every later recovery attempt in this player session.
// Keep successful imports cached and share in-flight requests.
export function createRetryableHlsLoader(loadModule) {
  if (typeof loadModule !== 'function') throw new TypeError('HLS module loader must be a function');

  let constructor = null;
  let pending = null;

  return async () => {
    if (constructor) return constructor;
    if (!pending) {
      pending = Promise.resolve()
        .then(loadModule)
        .then((module) => {
          const Hls = module?.default;
          if (typeof Hls?.isSupported !== 'function') {
            throw new TypeError('Invalid hls.js module');
          }
          constructor = Hls;
          return Hls;
        })
        .catch((error) => {
          // Do not cache a failed network/chunk load or invalid module forever.
          // The Player's existing bounded source watchdog still owns retries.
          pending = null;
          throw error;
        });
    }
    return pending;
  };
}
