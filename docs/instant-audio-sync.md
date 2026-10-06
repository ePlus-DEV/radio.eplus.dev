# InstantAudio country sync

The repository includes a scheduled GitHub Action that discovers country sites from
`https://instant.audio/` and uses the stream API endpoint exposed by those sites.

## Safety model

- Missing countries are imported by default.
- Existing countries are augmented safely: current stations stay untouched and only new, non-duplicate streams are appended.
- A run imports at most three missing countries unless manually targeted.
- InstantAudio's structured `result.station` + `result.streams` payload is preferred, so HTML/container entries are ignored and playable audio streams are selected explicitly.
- Stream endpoints are validated before a station is written; duplicate stream URLs are skipped.
- Requests are deliberately serialized and rate-limited.
- Changes are proposed through a pull request, never pushed directly to `main`.
- The Nuxt production generator must pass before the PR is created.
- The upstream endpoint is undocumented and can change without notice.

## Manual runs

From **Actions → InstantAudio data sync → Run workflow**:

- leave **country** empty to detect missing countries automatically;
- set **country** (for example `latvia`) to target one country;
- enable **refresh_existing** to scan existing countries for additional stations without replacing current data.
- targeting an existing **country** is also non-destructive and only appends newly discovered streams.

The script can also be tested locally:

```bash
node scripts/sync-instant-audio.mjs --country=cuba --refresh-existing --max-stations=3 --dry-run
```

## InstantAudio payload used

For endpoints such as `https://api.instant.audio/data/streams/45/radio-rebelde`, the sync reads station metadata (`title`, website, signal, ACRCloud availability) and the `streams` array. Entries marked as containers or non-audio MIME types are ignored. The structured stream list is used before the generic URL heuristic.

World metadata keeps the repository's existing underscore region keys (for example `north_america`) and `/assets/radio/...` data paths.

## Browser fallback for 403 responses

GitHub-hosted runners can be denied by InstantAudio with HTTP 403 even when the same endpoint works in a normal browser.

The sync now uses a circuit breaker:

1. try the structured InstantAudio API directly;
2. after 3 consecutive HTTP 403 responses, stop direct API requests for that country;
3. retry the remaining stations through **Crawlee + Playwright**, loading the real country station page in Chromium and calling the API from that browser origin;
4. if browser-origin requests are still blocked, fall back to Radio Browser instead of hammering InstantAudio.

The browser crawler runs with concurrency 1 and blocks image/font/media resources to reduce bandwidth and upstream load.
