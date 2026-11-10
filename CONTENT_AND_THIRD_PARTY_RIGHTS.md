# Content, data and third-party rights

ePlus OnAir is a radio discovery and listening application. Its original
application code and the radio programs accessible through it are **different
works with different rights holders**.

This document clarifies the scope of the root [MIT License](./LICENSE). It
does **not** change or add conditions to MIT-covered code, nor does it claim
ownership of third-party works or facts that are not protected by copyright.

## MIT-licensed source code

The MIT License covers **original source code and accompanying documentation**
that David Nguyen / ePlus OnAir contributors have the right to license,
including the first-party Nuxt/Vue app, UI/player logic, tests, scripts, and
deployment workflows. This includes original code in `components/`,
`composables/`, `stores/`, `pages/`, `plugins/`, `server/`, `utils/`,
`types/`, `config/`, `build/`, `scripts/`, `tests/`, `assets/css/`,
and first-party source configuration, to the extent owned by or licensed to
these contributors.

The MIT License permits copying, modification, redistribution, and
commercial use of covered code when its conditions are met. A fork may use
that code but receives **no license to the ePlus OnAir branding or any
third-party radio content** from this repository.

Any code incorporated from another project retains its own applicable
license and notices. The root MIT License does not relicense material whose
rights are held by unrelated third parties.

## Not included in the MIT grant

| Repository content | Scope and rights |
| --- | --- |
| `public/radio/**` | Geographic station directory data, names, schedules, streaming endpoints and associated provider metadata. Sources and permissions vary; no blanket rights grant or guarantee of redistribution, scraping or playback rights. |
| `public/catalog/providers/**` | Third-party provider directories, including Apple Music/TuneIn names, links and metadata; provider rights and terms remain applicable. |
| `public/img/**` | Station logos/artwork and other image assets, including images synced from InstantAudio/Radio Browser and seven Apple Music radio images sourced from TuneIn. No blanket MIT license; assess each image's provenance. |
| `public/brand/**`, `public/favicon.ico` | ePlus OnAir marks, logos, branding and associated visual assets. No trademark, endorsement or brand-asset license is granted by the MIT source-code license. |
| `data/instant-audio-countries.json`, `data/world.ts` | Imported or derived station/world metadata, to the extent it contains third-party material. Treat as data, not automatically MIT-licensed software. |
| Third-party packages, libraries, fonts, icons and other embedded materials | Their own license terms and attribution requirements apply, whether installed via npm or included elsewhere in the tree. |
| Live broadcasts, music, programs, stream segments, playlists, provider access credentials and signed stream URLs | Rights are held by broadcasters, artists, platforms or other licensors; they are **not** owned or licensed by ePlus OnAir. A public URL is not an authorization to rebroadcast, record, cache, redistribute or use a stream commercially. |

Some station directory fields are public facts or links that may not themselves
be copyrightable. This notice does not assert exclusive rights over such
facts; it only avoids promising permissions ePlus OnAir does not control.
The repository's public availability and any permitted playback functionality
are not evidence of rights to republish third-party audio or artwork.

`public/img/holiday/**` is also outside the default code grant pending a
per-asset provenance and permission review. New images should carry documented
ownership and applicable license information before redistribution.

## Secrets, environment configuration and private services

- Private `.env` files, credentials, API keys, deployment tokens and GitHub
  Environment Secrets are **not distributed** or licensed by this repository.
  `.env.example` describes public-safe configuration placeholders only.
- `NUXT_PUBLIC_*` values and `runtimeConfig.public` are **browser-visible** in
  Nuxt builds. They must not contain private credentials, even when set from
  a protected GitHub Environment.
- Private backends, stream resolvers and infrastructure not published here
  are not made open source by the MIT License on this repository.
- Never commit, log or redistribute expiring HLS `accessKey` values.

## Adding or correcting a station

Contributors must identify the official station/provider page, verify source
provenance, and document artwork and playback permission when available. Do
not upload a third party's image or copy a proprietary catalog just because
it is publicly reachable. Do not record, mirror or redistribute third-party
audio without appropriate permission.

A maintainer may remove or replace a station link, metadata or artwork if
the source is unauthorized or a rights holder requests correction.

## Rights-holder contact

If you own or represent a station, artwork, trademark, metadata or audio
program and have a rights concern, please contact **report@eplus.dev**
with the specific ePlus OnAir URL, the material involved, a description of
your rights and your requested correction or removal. Do **not** send API
keys, access tokens or other secrets.

A source-code issue report is not a substitute for permission from the
relevant station, rights holder or stream provider.

This document is an explanation of licensing scope, not legal clearance
of any individual station, image, provider API or stream.
