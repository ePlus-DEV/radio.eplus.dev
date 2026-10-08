# Radio ePlus SEO Architecture

Last updated: **2026-10-08**

This file is the durable SEO checklist for Radio ePlus. It records what is implemented, what is intentionally not implemented, and the reasons behind those decisions.

## Canonical site

- Production origin: `https://radio.eplus.dev`
- Canonical URLs are generated in `app.vue` from the current route path.
- Preview/deployment hosts must not replace the production canonical origin unless `NUXT_PUBLIC_SITE_URL` is intentionally changed.

## Indexable route model

The primary indexable content hierarchy is:

```text
/                              Home / regions
/{area}                        Region / country collection
/{area}/{country}              Country / station collection
/{area}/{country}/{station}    Station detail
```

Country and station catalogs are loaded during SSR/prerender from local repository JSON so crawlers receive real internal links and station metadata without requiring client JavaScript.

Realtime data is different:

- schedules
- current-song/detail APIs
- lyrics

Those remain client-only and must never block SSR/prerender.

## Metadata

Global metadata:

- canonical URL
- robots: `index, follow`
- Open Graph site identity
- Open Graph locale
- default social image
- Twitter large-image card
- image alt text
- WebSite JSON-LD
- Organization JSON-LD

Page metadata:

- unique title
- unique description
- explicit Open Graph URL
- page-specific image where available
- image alt text on station/country social metadata

## Structured data

Current JSON-LD coverage:

| Route | Structured data |
| --- | --- |
| `/` | WebSite, Organization, CollectionPage / ItemList |
| `/{area}` | BreadcrumbList, CollectionPage / ItemList |
| `/{area}/{country}` | BreadcrumbList, CollectionPage / ItemList |
| `/{area}/{country}/{station}` | BreadcrumbList, RadioStation |

Do not mark realtime schedule/song/lyric data as static structured data unless it can be rendered reliably and truthfully at crawl time.

## Sitemap

`@nuxtjs/sitemap` receives all radio routes from `build/radioRoutes.ts`.

Route discovery only treats a `public/radio/<area>/` directory as an area when it contains country JSON catalogs. Asset-only folders must never become sitemap/prerender routes.

The sitemap intentionally does **not** emit `lastmod` yet.

Filesystem mtimes from CI/deployment checkouts are not reliable content-modification timestamps; using them would effectively tell crawlers that every page changed on every deployment. Add `lastmod` only when the catalog has a durable update timestamp or the build has a trustworthy per-file history source.

## Robots and agent discovery

Public files:

- `/robots.txt`
- `/sitemap.xml`
- `/llms.txt`
- `/agents.md`

`/api/` is disallowed in robots because it is not intended as indexable site content.

## 404 behavior

Unknown region/country/station URLs must not silently render an empty page with HTTP 200.

Current rules:

- unknown area → 404
- missing country catalog → 404
- missing station in a valid catalog → 404

Avoid soft-404 regressions.

## Internal linking

Area pages expose country links during SSR.

Country pages expose station links during SSR.

Station detail pages also expose the country station collection so crawlers and users can navigate laterally.

Do not move country/station discovery back behind `onMounted()` or client-only fetches.

## Multilingual SEO limitation

The UI supports multiple languages, but Nuxt i18n currently uses:

```ts
strategy: "no_prefix"
```

That means all languages share the same canonical URL.

Because there is no distinct URL per locale, **Radio ePlus does not currently have true multilingual SEO/hreflang coverage**.

Do not generate multiple `hreflang` entries that all point to the same URL merely to satisfy a checklist. Proper multilingual SEO requires a route migration such as:

- `prefix_except_default`, or
- `prefix_and_default`

That change affects canonical URLs, sitemap entries, internal links, redirects and historical indexing, so it must be handled as a dedicated migration.

## Static navigation pages

As of 2026-10-08, the repository still does not contain:

- `/about`
- `/privacy-policy`
- `/terms-of-use`
- `/statistics`

A prerender regression exposed that sitewide Header/Footer links to these missing routes were being crawled and treated as hard prerender failures after the new 404 guards were introduced.

Those links are now removed until real pages exist.

Do not invent Privacy Policy or Terms content. Re-add these navigation items only when matching owner-approved pages exist. `/about` and `/statistics` can be implemented separately with factual product/data content.

## Search-result enhancement decisions

Not currently added:

- SearchAction JSON-LD

Reason: the site search is an in-page modal and there is no stable public search-result URL template. Do not advertise a SearchAction until such a route exists.

## Validation

At minimum:

```bash
npm test
npm run generate
```

Important SEO regression test:

```text
tests/seo-page-foundation.test.mjs
tests/seo-structured-data.test.mjs
```

Manual production checks after deployment:

- page source contains expected canonical/title/description
- country page source contains station links without executing JS
- invalid area/country/station URL returns 404
- `/sitemap.xml` contains the expected canonical routes
- `/robots.txt` references the production sitemap
- JSON-LD parses correctly
- social preview image resolves publicly
- no preview hostname leaks into canonical or Open Graph URLs

## Rule for future AI/contributors

SEO work should prioritize, in order:

1. correct HTTP/indexability behavior;
2. server-rendered discoverable content/internal links;
3. canonical and duplicate-control;
4. structured data;
5. social metadata;
6. crawler convenience files.

Do not treat keyword stuffing or adding arbitrary meta tags as an SEO fix.
