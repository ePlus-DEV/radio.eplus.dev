/**
 * Prevent a delayed catalog lookup from activating a restored Country station
 * after the listener has chosen something else or canceled the original Play.
 * The caller checks this both after awaiting the catalog and before falling
 * back to navigation when a lookup fails.
 */
export function isCurrentRestoredCountrySelection(expected, state) {
  return Number.isInteger(expected?.generation)
    && expected.generation === state?.generation
    && expected.pauseRequest === state?.pauseRequest
    && expected.stationUrl === state?.stationUrl
    && state?.requestedStationUrl === ''
    && state?.hasSources === false;
}
