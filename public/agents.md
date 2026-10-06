# Radio ePlus Agent Guide

Radio ePlus provides public, read-only discovery pages for internet radio stations.

## Preferred discovery order

1. Read https://radio.eplus.dev/sitemap.xml for canonical browse and station URLs.
2. Use country pages to discover stations by geography.
3. Use station pages for station names, descriptions, artwork, and listening context.

## URL model

- Region: https://radio.eplus.dev/{area}
- Country: https://radio.eplus.dev/{area}/{country}
- Station: https://radio.eplus.dev/{area}/{country}/{station}

## Crawling

Respect https://radio.eplus.dev/robots.txt. Public page URLs are intended for discovery; internal /api/ routes are not.
