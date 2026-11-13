// Library panels share the existing /library route. Preserve legacy hashes and
// reject unknown values instead of constructing arbitrary URLs.
export const LIBRARY_TAB_VALUES = Object.freeze(['favorites', 'recent', 'collections', 'custom', 'stats']);

export const libraryTabFromHash = hash => {
  const value = typeof hash === 'string' && hash.startsWith('#') ? hash.slice(1) : '';
  return LIBRARY_TAB_VALUES.includes(value) ? value : 'all';
};

export const libraryTabHref = value =>
  LIBRARY_TAB_VALUES.includes(value) ? `/library#${value}` : '/library';
