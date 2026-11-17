// Storage can throw in private browsing, sandboxed frames or restricted browsers.
// Player controls must remain usable even when persistence is unavailable.
export function readPlayerStorage(key, getStorage = () => globalThis.localStorage) {
  try { return getStorage().getItem(key); } catch { return null; }
}

export function writePlayerStorage(key, value, getStorage = () => globalThis.localStorage) {
  try { getStorage().setItem(key, value); return true; } catch { return false; }
}
