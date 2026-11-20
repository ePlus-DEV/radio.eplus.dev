# ePlus OnAir — installable PWA shell (#346)

This is an **online-first app shell**, not an offline radio player.

## Architecture and origin isolation

- The browser manifest remains at `/brand/site.webmanifest` and uses relative
  `../` URLs so its start URL, scope and shortcuts follow the current Pages
  project base path. Production and Staging each use their own root origin.
  Pull request previews use isolated `/pr-preview/pr-N/` scopes.
- `plugins/onair-pwa.client.ts` registers `/service-worker.js` only in a built
  client on load; the scope is derived from Nuxt's `app.baseURL`. Development
  server / hot reload is deliberately excluded.
- The worker pre-caches **only** `offline.html`, a small static, noindex,
  self-contained explanation. Navigation requests go to the network first.
  On a network failure, the worker displays the translated offline explanation.
  The fallback page listens for browser connectivity changes and also probes the
  same-origin, deployment-scoped web manifest with a 5-second timeout and
  backoff (3 to 15 seconds). It reloads the **original URL** only after a valid
  network response, does not loop-refresh while offline, and pauses background
  probes while hidden. The manual Retry button uses the same verification.
- There is **no audio cache**: MP3/AAC, .m3u8 playlists, HLS segments, provider
  requests, API, JS, CSS, search index JSON and all real station HTML stay
  network-only. A stream always requires a current online connection.
- Versioned worker caches remove only stale keys with a scope-specific `onair-offline-shell-[scope]-v`
  prefix, so one PR preview cannot delete another preview's offline cache. No `skipWaiting`, `clients.claim`, forced reload or background
  stream polling during update: the existing global player stays in control.
- Do not change the site's SEO, canonical URLs, sitemap, noindex staging policy,
  local favorites, history or player behavior while adding installability.

## Install guidance

**Android Chrome / supported Chromium browsers:** visit the public site over
HTTPS, open the browser menu and choose *Install app* or *Add to Home screen*
when offered. Installation prompts vary by browser and require a secure origin
and a qualifying install manifest.

**iPhone Safari:** use Share → *Add to Home Screen*. iOS home-screen web apps
have different background audio, Media Session and storage behavior than Safari
tabs; test on the actual device before marking #340 or #346 complete.

## QA checklist

- [ ] On production-origin build, inspect `/brand/site.webmanifest` and confirm
      192/512 icon URLs and manifest scope resolve; repeat under preview subpath.
- [ ] Install on Android Chrome and open the app from its launcher.
- [ ] Add to Home Screen on Safari iOS, test lock-screen/audio interruptions.
- [ ] With the app open, go offline then navigate: see the offline explanation;
      restore connection and verify automatic recovery to the same page without
      pressing Retry. Also verify Retry works and no repeated reloads occur
      while disconnected, including when the browser omits an online event.
- [ ] Repeat the recovery test on a station deep link and on a
      `/pr-preview/pr-N/` deployment: its connectivity probe must stay within
      the active Pages scope. A browser reload must leave the player paused.
- [ ] Use DevTools Application → Cache Storage: **only** `offline.html` is
      precached; no station catalog, stream segments or signed URLs.
- [ ] Update the worker: no forced reload, old audio continues, next visits
      fetch fresh HTML and JSON rather than replaying stale caches.
- [ ] `npm test`, `npm run generate:site`, SEO/GA4 noindex and GitHub Pages
      subpath validations, mobile light/dark and safe-area smoke tests.

The automated tests verify worker/cache policy, manifest URL resolution, and
offline-page automatic recovery, polling backoff and preview-scoped probes.
Physical iOS/Android QA remains **not run** until independently documented.
