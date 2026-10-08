# Radio ePlus Agent Guide

Radio ePlus provides public, read-only discovery pages for internet radio stations.

## Preferred discovery order

1. Read https://radio.eplus.dev/sitemap.xml for canonical browse and station URLs.
2. Read https://radio.eplus.dev/radio/world.json for geographic catalog metadata when structured data is preferable.
3. Read https://radio.eplus.dev/radio/{area}/{country}.json for a country's station catalog.
4. Use country pages to discover the same station links in human-readable HTML.
5. Use station pages for station names, descriptions, artwork, and listening context.

## URL model

- Region: https://radio.eplus.dev/{area}
- Country: https://radio.eplus.dev/{area}/{country}
- Station: https://radio.eplus.dev/{area}/{country}/{station}

## Data freshness

Catalog JSON is version-controlled discovery metadata. Stream availability and realtime schedule/current-song/lyric information can change more frequently and should be treated as live data rather than durable facts.

## Crawling

Respect https://radio.eplus.dev/robots.txt. Public page and /radio/ catalog URLs are intended for discovery; internal /api/ routes are not.
