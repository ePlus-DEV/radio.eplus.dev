# InstantAudio country sync

The repository includes a scheduled GitHub Action that discovers country sites from
`https://instant.audio/` and uses the stream API endpoint exposed by those sites.

## Safety model

- Missing countries are imported by default; existing country files are not overwritten.
- A run imports at most three missing countries unless manually targeted.
- Stream endpoints are validated before a station is written.
- Requests are deliberately serialized and rate-limited.
- Changes are proposed through a pull request, never pushed directly to `main`.
- The Nuxt production generator must pass before the PR is created.
- The upstream endpoint is undocumented and can change without notice.

## Manual runs

From **Actions → InstantAudio data sync → Run workflow**:

- leave **country** empty to detect missing countries automatically;
- set **country** (for example `latvia`) to target one country;
- enable **refresh_existing** only when intentionally refreshing an existing file.

The script can also be tested locally:

```bash
node scripts/sync-instant-audio.mjs --country=cuba --refresh-existing --max-stations=3 --dry-run
```
