/** Display search results in bounded batches without misreporting match counts.
 * Filtering/ranking is performed once by the caller; this helper never mutates
 * its input or hides the total number of matching stations.
 */
export const SEARCH_RESULTS_PAGE_SIZE = 100;

export function paginateStationResults(matches, page = 1) {
  const items = Array.isArray(matches) ? matches : [];
  const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const displayed = Math.min(items.length, safePage * SEARCH_RESULTS_PAGE_SIZE);
  return {
    items: items.slice(0, displayed),
    shown: displayed,
    total: items.length,
    hasMore: displayed < items.length,
  };
}
