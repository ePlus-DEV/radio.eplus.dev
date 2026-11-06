import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEARCH_FEATURED_STATION_IDS, VIETNAM_FEATURED_STATION_IDS } from '../utils/featured-stations.mjs';
import { stationCatalogIdentity, stationListingPriority } from '../utils/station-catalog-identity.mjs';

const featuredIds = new Set(VIETNAM_FEATURED_STATION_IDS);
const searchFeaturedIds = new Map(SEARCH_FEATURED_STATION_IDS.map((id, index) => [id, index + 1]));
const humanLabel = value => value.replaceAll('-', ' ').replaceAll('_', ' ');

/**
 * Generate a single static JSON catalog that works without Algolia.
 * The index contains public display fields only, never API credentials or
 * streaming URLs. Call it from npm predev/prebuild/pregenerate.
 */
export async function buildStationSearchIndex({
  radioRoot = 'public/radio',
  outputFile = 'public/search/stations.json',
  providerRoot = 'public/catalog/providers',
} = {}) {
  const result = [];
  // Canonicalize only repeated titles from the same country + official site.
  // Keep all individual catalog routes (including aliases) intact for SEO.
  const identityPositions = new Map();
  for (const area of (await readdir(radioRoot, { withFileTypes: true })).filter(x => x.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const areaPath = join(radioRoot, area.name);
    for (const countryFile of (await readdir(areaPath, { withFileTypes: true })).filter(x => x.isFile() && x.name.endsWith('.json')).sort((a, b) => a.name.localeCompare(b.name))) {
      const country = countryFile.name.slice(0, -5);
      const catalog = JSON.parse(await readFile(join(areaPath, countryFile.name), 'utf8'));
      for (const [id, station] of Object.entries(catalog)) {
        if (!station || typeof station.title !== 'string' || !station.title.trim()) continue;
        if (!/^https?:\/\//i.test(String(station.stream || '')) || station.disabled === true || station.active === false) continue;
        const item = {
          objectID: `${area.name}/${country}/${id}`,
          station_name: station.title,
          station_country: `world.${area.name.replaceAll('-', '_')}.${country.replaceAll('-', '_')}`,
          country_label: humanLabel(country),
          // Optional public facets; do not guess a genre or language from a name.
          station_category: typeof station.category === 'string' ? station.category.trim() : '',
          station_language: typeof station.language === 'string' ? station.language.trim() : '',
          station_image: station.features || '/brand/onair-mark.svg',
          url: `/${area.name}/${country}/${id}`,
          featured: area.name === 'asia' && country === 'viet-nam' && featuredIds.has(id),
          featured_rank: searchFeaturedIds.get(`${area.name}/${country}/${id}`) || 0,
        };
        const identity = stationCatalogIdentity(station);
        const key = identity ? `${area.name}/${country}/${identity}` : '';
        const rank = stationListingPriority(id, station, item.featured_rank);
        const previous = key ? identityPositions.get(key) : null;
        if (previous) {
          if (rank > previous.rank) {
            result[previous.index] = item;
            identityPositions.set(key, { index: previous.index, rank });
          }
          continue;
        }
        if (key) identityPositions.set(key, { index: result.length, rank });
        result.push(item);
      }
    }
  }
  // Global providers are discoverable radio *pages*, not geographic HTMLAudio streams.
  // Index display metadata only: never include a TuneIn endpoint, token, or stream URL.
  let providerIndex;
  try {
    providerIndex = JSON.parse(await readFile(join(providerRoot, 'index.json'), 'utf8'));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    providerIndex = { providers: [] };
  }
  for (const provider of providerIndex.providers || []) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(provider?.id || '')) ||
      provider.catalog !== '/catalog/providers/' + provider.id + '.json' ||
      provider.href !== '/global-radio/' + provider.id) {
      throw new Error('Invalid Global Radio search provider manifest');
    }
    const catalog = JSON.parse(await readFile(join(providerRoot, provider.id + '.json'), 'utf8'));
    if (!Array.isArray(catalog.stations) || catalog.id !== provider.id) {
      throw new Error('Invalid Global Radio search station catalog: ' + provider.id);
    }
    const seen = new Set();
    for (const station of catalog.stations) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(station?.id || '')) ||
        !String(station?.title || '').trim() || seen.has(station.id)) {
        throw new Error('Invalid or duplicate Global Radio search station: ' + provider.id);
      }
      seen.add(station.id);
      const image = String(station.image || '');
      const imageIsTrusted = image === '/img/global-radio/' + station.id + '.png' ||
        image === '/img/global-radio/' + station.id + '.jpg';
      result.push({
        objectID: 'global-radio/' + provider.id + '/' + station.id,
        station_name: station.title,
        station_country: 'global_radio.title',
        country_label: provider.name,
        station_category: String(station.genre || ''),
        station_language: String(station.language || ''),
        station_image: imageIsTrusted ? image : '/brand/onair-mark.svg',
        url: provider.href + '/' + station.id,
        featured: false,
        featured_rank: 0,
      });
    }
  }

  result.sort((a, b) => {
    if (a.featured_rank || b.featured_rank) return (a.featured_rank || 9999) - (b.featured_rank || 9999);
    return Number(b.featured) - Number(a.featured) || a.station_name.localeCompare(b.station_name);
  });
  await mkdir(dirname(outputFile), { recursive: true });
  await writeFile(outputFile, JSON.stringify(result));
  return result;
}

/**
 * A cache-hit is supplied only by GitHub Actions when the radio catalog,
 * ranking rules and generator hash exactly match the saved artifact.
 * Local builds and invalid/missing restored files always regenerate.
 */
export async function cachedSearchIndexCount(
  outputFile = 'public/search/stations.json',
  cacheHit = process.env.ONAIR_SEARCH_INDEX_CACHE_HIT === 'true',
) {
  if (!cacheHit) return null;
  try {
    const saved = JSON.parse(await readFile(outputFile, 'utf8'));
    if (!Array.isArray(saved) || saved.length === 0 ||
      !saved.every(item => typeof item.objectID === 'string' && typeof item.station_name === 'string')) {
      return null;
    }
    return saved.length;
  } catch {
    return null;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const count = await cachedSearchIndexCount();
  if (count !== null) {
    process.stdout.write(`Reused cached local radio search index: ${count} stations\n`);
  } else {
    const stations = await buildStationSearchIndex();
    process.stdout.write(`Built local radio search index: ${stations.length} stations\n`);
  }
}
