# Reporting bugs and requesting changes

ePlus OnAir accepts **public GitHub Issues**. Issue templates are stored in `.github/ISSUE_TEMPLATE/` and become selectable after they reach the default `main` branch. Each form opens a **draft**; only the user submits the issue after reviewing it.

| Where | Action | GitHub template |
| --- | --- | --- |
| Failed radio playback | Player → Recovery → Report (email to `report@eplus.dev` or GitHub; terminal errors only) | `01-playback.yml` |
| Website layout, navigation, search, accessibility or PWA error | Contact → Report a website bug | `02-website-bug.yml` |
| New station / outdated station details | Contact → Request a station update | `03-station-update.yml` |
| Feature idea | GitHub Issues → New issue | `04-feature-request.yml` |
| Sensitive legal / copyright requests | Contact → Email support | Existing email channel (not public issues) |

## Listener-friendly recovery and email reporting

- The normal error display shows one short, plain-language explanation and clear Retry, alternative playback (when available) and Report actions. Do not show a blocking panel during routine connecting/buffering.
- Diagnostic details remain available only in a collapsed **More information** area for troubleshooting; do not assume one device's playback failure means the whole station is offline.
- Email reporting opens an editable draft through `mailto:report@eplus.dev` and includes only the validated public station page, a cleaned station title, and an optional simple description. It sends nothing automatically, requires no GitHub account, and never includes the raw stream address or tokens.
- The Contact page offers the same report mailbox alongside the existing `support@eplus.dev` link and optional GitHub issue forms.

## Safe reporting contract

- The report button must open a **GitHub Issue Form** using `?template=01-playback.yml` and prefill only `title`, `station_url`, and `observed_state`. The latter two are form field IDs, not a free-form issue body.
- `station_url` is the canonical **public** station page on `https://radio.eplus.dev`, never the raw audio stream or a staging/preview page. A valid Apple Music Global Radio detail page is also a valid public station page.
- `observed_state` is restricted to known local playback health codes, not network response details, provider access tokens, source hosts, history, analytics, browser fingerprint, exact timing or signed stream URL. Unknown values must become `unknown`. Titles are length-limited and cleaned of URLs/control characters.
- The user must provide reproduction steps, expected behavior and device/browser context voluntarily. Never auto-submit an issue; GitHub sign-in may be required. GitHub's mobile app may not consistently preserve prefilled query fields, so the reporter should inspect the draft and re-enter missing details.
- Only show the playback-report action for **terminal** online health states (`exhausted` / `unsupported`). Do not invite reports during normal buffering, connection attempts or offline conditions; do not declare a station globally offline from a single device observation.
- The website Contact page keeps the issue forms for bugs/station updates and the support email; email reporting is an additional channel.
- Never publish private credentials, cookies, signed HLS URLs, or listening history. Do not change existing SEO titles, canonical tags, GA4 or marketing copy as collateral work.

## Test and release

- `npm test` includes `tests/listening-tools.test.mjs` and `tests/issue-reporting.test.mjs` to check public URL safety, form field IDs, required templates, UI links and seven-language labels.
- Issue forms appear in the GitHub chooser only on the default branch. Use the approved release flow: make the change on `staging`, open a **direct `staging` → `main` PR**, run CI, and verify the production deployment separately.
- After the forms reach `main`, manually open the player report link from a failing station and the two Contact page actions; confirm that the intended form appears, local context is prefilled (if supported by the browser), no private data is transmitted, and submission remains user-controlled.
