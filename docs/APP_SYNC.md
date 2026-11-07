# Web to app synchronization

The workflow runs only after a push to production `main`; merges to staging do not trigger it. It can also be manually dispatched on `main` with an earlier and a later production commit SHA.

It compares those commits. JSON station catalogs under `public/radio/` are copied to `ePlus-DEV/onair-apps/frontend/public/radio/` only if the app file exactly matches the earlier web version. Divergent files are not overwritten. UI and shared logic changes under components, composables, stores, utils, pages, lang and assets are listed for manual comparison in the app PR; they are not automatically applied. A draft app PR is opened for the source commit, and app PR validation runs without native builds. The workflow does not merge or publish.

## Required repository secret

Add `ONAIR_APP_SYNC_TOKEN` as an Actions secret in this web repository. Use a dedicated GitHub App installation token or fine-grained token scoped to `ePlus-DEV/onair-apps` with Contents and Pull requests read/write permissions. Follow the organization's token policy. Never commit credentials. The default workflow token cannot write to the separate app repository.

The first production run should be reviewed carefully: historical app and web differences are recorded as conflicts, not overwritten. If the token is missing, the workflow fails with a configuration error. A manual dispatch can retry an explicit commit range once configured; avoid skipping missed production commits. Check the app PR and validate relevant fixes manually. Build and publish app releases separately.
