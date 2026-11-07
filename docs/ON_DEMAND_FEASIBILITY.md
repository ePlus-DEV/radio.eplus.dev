# On-demand podcast & broadcaster catch-up feasibility

**Status:** Research decision — **NO-GO for in-app third-party playback until per-feed permissions and technical checks are documented**  
**Reviewed:** 2026-11-07 · **Issue:** [#353](https://github.com/ePlus-DEV/radio.eplus.dev/issues/353)  
**Scope:** Potential future on-demand mode, **not** a plan to record/rebroadcast linear radio. No new player, feed crawler, route, schedule or production settings are implemented by this document.

## Executive decision

A separate on-demand experience is technically feasible for **publisher-owned or explicitly authorized** podcast RSS feeds. A public RSS address is **distribution metadata, not a blanket third-party license** to mirror audio, hotlink artwork, scrape a broadcaster's archive or index a commercial directory. No third-party catalog source is approved for in-app playback by this review.

**Recommended order:**

1. **Documentation and authorized-source acquisition (now):** identify a feed owned by ePlus or obtain a specific written license/permission covering third-party directory listing, metadata/artwork, direct episode playback, and geographic availability. Keep source, permission scope, expiry and contact in a maintainer-reviewed allowlist.
2. **Read-only small pilot (separate issue/approval):** for 1–3 explicitly authorized feeds, expose show title, canonical publisher links and a bounded episode list. Start with **publisher link-out** if audio playback rights or browser behavior are unverified. Do not silently reuse existing live-radio catalogs.
3. **Optional in-app on-demand player (later, conditional):** only after the publisher authorizes hotlinked audio, supports range requests, and representative iOS/Android/desktop browser testing passes. Use a **distinct** playback/session state machine. Do not interpret an episode as a live station or reuse live edge, Next/Previous station, fallback, duration stats or Media Session semantics without a migration design.

**Go/no-go gate:** no authorized sample feed = no on-demand UI or client-provided arbitrary RSS fetch. This document does **not** approve ingesting BBC, Spotify, Apple Music, TuneIn, or other broadcasters' catalogs.

## Source and rights matrix

| Source class | Technical evidence | Rights/attribution position | Decision |
| --- | --- | --- | --- |
| **Publisher-owned/ePlus-controlled RSS** | RSS 2.0 feed with stable GUID, enclosure URL, MIME type, length, dates, art and reachable episode byte ranges (verify in pilot) | The publisher controls rights and can explicitly authorize indexing, episode playback and artwork; still assess music/third-party content and geographic restrictions | **Candidate after ownership/content-rights checks** |
| **RSS listed in Apple Podcasts** | Apple documents public RSS 2.0, required tags, artwork and episode enclosure; validation includes byte-range/HEAD accessibility | **Apple technical acceptance does not license ePlus to copy/host/stream a third-party show**. Obtain permission from the actual show publisher | **Reference standard only; no blanket ingestion approval** |
| **Spotify for Creators hosted/distributed RSS** | Spotify explains creator opt-in RSS distribution, public metadata/audio links and public creator contact details | A creator enabling RSS does not grant unlimited third-party reuse; Spotify warns about unrequested aggregation and separately enforces copyrighted content | **Request creator authorization and verify allowed usage** |
| **BBC podcasts / broadcaster catch-up** | BBC's published terms cover shows, audio, artwork, branding and metadata, including RSS | BBC states permission is required for reuse, with distinct rules for share buttons/embeds and business use. Availability of a feed or a personal download button is **not** permission to rehost or re-embed raw audio | **No ingest/direct playback without explicit BBC authorization; official links or official permitted share/embed only** |
| **Other broadcaster archives / proprietary app or signed HLS** | Feed may be absent, regional, authenticated, expiring or protected by CORS | Rights and provider terms **not verified**; don't derive permanent audio from live HLS, reverse engineer signing, capture subscriber content or guess availability | **External publisher link only pending permission** |

**Evidence:** Apple [RSS requirements](https://podcasters.apple.com/support/823-podcast-requirements), [feed validation](https://podcasters.apple.com/support/829-validate-your-podcast); Spotify [RSS distribution](https://support.spotify.com/ag/creators/article/finding-and-enabling-your-rss-feed/), [copyright guidance](https://creators.spotify.com/resources/copyright-creator-education); BBC [terms of use](https://bbc.com.im/usingthebbc/terms-of-use) and [reuse/business rules](https://bbc.com.im/usingthebbc/terms/can-i-use-bbc-content-for-my-business/). Documentation reviewed 2026-11-07. This is a preliminary product/compliance matrix, **not legal clearance for any particular feed**.

## Proposed metadata record (research schema, not implemented)

Keep on-demand records isolated from `public/radio/**`, `public/catalog/providers/**`, station-search indexing and the existing live player:

```text
show: publisher_id, publisher_homepage, rss_source (maintainer-private config),
      display_title, canonical_show_url, description, language,
      artwork_url + license_status, rights_evidence, last_successful_check
episode: show_id, guid, canonical_episode_url, title, published_at,
         duration_if_reported, enclosure_type, enclosure_length_if_reported,
         enclosure_url (only if playback authorized), availability_status
```

Every public field needs a provenance flag. A displayable GUID is not a secure key: normalize it, store publisher/show scope and deduplicate against canonical URLs as well as GUID changes. Never emit signed tokens, subscription-only URLs, creator email from RSS, authentication values or private metadata into static JSON. Store rights contact and permission evidence outside public build artifacts.

**Freshness:** RSS `pubDate` means a publisher-stated episode date, not when ePlus verified access. Use `last_successful_check` only when an actual allowed fetch succeeds; otherwise report `unknown` rather than fabricated `live`/availability. Handle episode removal, edits, redirects and expired permissions with safe withdrawal.

## Static GitHub Pages feasibility

- Keep static SSR-visible **links** to authorized shows/episodes on distinct future paths such as `/podcasts` and `/podcasts/<show>`, only if there is meaningful, rights-cleared content. Never reuse a live radio station route, Schema.org `RadioStation`, or an existing canonical.
- A GitHub Action can refresh approved show metadata periodically (proposal: once per 24 h), using conditional requests/ETag where allowed, with max feed size (proposal: 1 MB), bounded episodes (proposal: 20 per show), timeouts, and stable deterministic output. Feed cadence must respect publisher terms. **No workflow is authorized or added here.**
- Maintain an allowlist and secure XML parsing (disable external entities), restrict HTTPS destinations and redirects to reviewed public hosts, validate DNS targets against private/link-local ranges, and enforce rate limits to reduce SSRF and amplification risks. Never expose an arbitrary user-entered URL to a privileged GitHub Actions downloader.
- Do not fetch audio or artwork at build time without rights and a separate asset budget. The existing Pages production output previously approached the 1 GB limit; preserve the repository's **<=800 MiB target** and CI size audit instead of producing thousands of duplicate episode pages.
- SEO requires original, useful visible summaries with attribution, publisher canonical/rights review and accurate episode dates. Avoid automatically indexing sparse or duplicate publisher descriptions. No fabricated localized `hreflang` while using locale `no_prefix`; keep Staging `noindex`, production canonical/GA4 and current sitemap untouched by feasibility research.
- PWA/service worker must not cache audio enclosures, HLS segments or imply offline episodes. Release reviews must verify both source build and **destination** Pages deployment.

## Browser and playback separation

RSS discovery through browser `fetch()` requires permission via cross-origin response headers; the ability of an ordinary media element to attempt cross-origin playback is **not** equivalent to script read access. The `crossorigin` attribute changes media CORS behavior and can make a previously playable third-party source fail; test behavior on real target hosts. See [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) and [HTML media crossorigin](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/crossorigin).

For a later permitted on-demand player:

- Episode timeline is finite and seekable **only if** the server supports range requests and the format/browser permits it. Do not promise seeking, download, offline or variable speed without testing.
- On-demand `currentTime`, `duration`, resume progress, completed status, skip +/-15 s and episodic Next differ from live `Resume at Live`, station Next/Previous, bounded source fallback and listening-time accounting.
- A switch between live and on-demand must explicitly stop the previous engine so audio never overlaps. Reuse visual design tokens, accessibility semantics, i18n and Media Session **interfaces** where safe, not the live lifecycle implicitly.
- Test iPhone Safari/Home Screen and Android Chrome for paused/locked/background playback, headphone controls, CORS, byte ranges and network transitions before announcing feature support.

## Acceptance, risks and next step

| Acceptance check | Research result |
| --- | --- |
| Written feasibility before UI/player changes | **Complete in this document** |
| Preliminary source/rights matrix | **Complete**, no third-party playback authorized |
| RSS metadata, artwork, CORS, update cadence, static Pages and SEO risks | **Assessed** with source-backed cautions and proposed safeguards |
| Read-only catalog prototype | **Not approved**; requires independently verified source permission and a new scoped issue |
| Device playback and download rights | **Unknown** until a rights-cleared feed is chosen and tested |
| Recording or caching third-party linear radio | **Not allowed by this plan** |

**Outcome for #353:** feasibility research is complete as a **conditional NO-GO for direct third-party audio integration**. Future product work requires a newly approved, narrowly scoped issue with feed-specific rights evidence; do not treat closing this research task as permission to implement or import media. Preserve existing seven-locale live-radio UI, audio, SEO and site analytics unchanged.
