/** Distinguish a successfully loaded empty catalog from one not yet loaded. */
export function createSearchIndexLoadState() {
  let loaded = false;
  return {
    isLoaded: () => loaded,
    markLoaded: () => { loaded = true; },
  };
}
