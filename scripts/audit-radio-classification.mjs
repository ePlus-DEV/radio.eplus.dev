import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RADIO_AREAS, RADIO_CONTENT_GROUPS, stationClassificationRecord,
} from '../utils/station-classification.mjs';

// This is a complete source inventory, not a live stream health check.
// Outputs deliberately live outside /public to avoid enlarging Pages deploys.
export async function auditRadioClassification({
  radioRoot = 'public/radio',
  providerRoot = 'public/catalog/providers',
  csvOutput = 'reports/radio-classification.csv',
  summaryOutput = 'reports/radio-classification-summary.json',
} = {}) {
  const records = [];
  for (const area of (await readdir(radioRoot, { withFileTypes: true }))
    .filter(item => item.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    if (!RADIO_AREAS.includes(area.name) || area.name === 'global-radio') {
      throw new Error('Unknown geographic catalog area: ' + area.name);
    }
    for (const file of (await readdir(join(radioRoot, area.name), { withFileTypes: true }))
      .filter(item => item.isFile() && item.name.endsWith('.json'))
      .sort((a, b) => a.name.localeCompare(b.name))) {
      const country = file.name.slice(0, -5);
      const items = JSON.parse(await readFile(join(radioRoot, area.name, file.name), 'utf8'));
      for (const [id, station] of Object.entries(items)) {
        if (!station || typeof station !== 'object' || Array.isArray(station)) {
          throw new Error('Invalid station record in ' + file.name + ': ' + id);
        }
        records.push(stationClassificationRecord(
          '/' + area.name + '/' + country + '/' + id, station,
        ));
      }
    }
  }

  let providerManifest;
  try {
    providerManifest = JSON.parse(await readFile(join(providerRoot, 'index.json'), 'utf8'));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    providerManifest = { providers: [] };
  }
  for (const provider of providerManifest.providers || []) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(provider?.id || '')) ||
      provider.catalog !== '/catalog/providers/' + provider.id + '.json' ||
      provider.href !== '/global-radio/' + provider.id) {
      throw new Error('Invalid provider catalog manifest');
    }
    const catalog = JSON.parse(await readFile(join(providerRoot, provider.id + '.json'), 'utf8'));
    if (!Array.isArray(catalog.stations) || catalog.id !== provider.id) {
      throw new Error('Invalid provider station catalog: ' + provider.id);
    }
    for (const station of catalog.stations) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(station?.id || ''))) {
        throw new Error('Invalid provider station id');
      }
      records.push(stationClassificationRecord(
        provider.href + '/' + station.id, station, station.genre,
      ));
    }
  }

  records.sort((a, b) => a.path.localeCompare(b.path));
  const paths = new Set();
  for (const item of records) {
    if (paths.has(item.path)) throw new Error('Duplicate catalog station path: ' + item.path);
    paths.add(item.path);
  }
  const countByArea = Object.fromEntries(RADIO_AREAS.map(area => [area, 0]));
  const countByGroup = Object.fromEntries(RADIO_CONTENT_GROUPS.map(group => [group, 0]));
  let contentClassified = 0, declaredCategory = 0, declaredLanguage = 0;
  for (const item of records) {
    countByArea[item.area]++;
    for (const group of item.groups) countByGroup[group]++;
    if (item.groups[0] !== 'unknown') contentClassified++;
    if (item.catalogCategory) declaredCategory++;
    if (item.language) declaredLanguage++;
  }
  const summary = {
    total: records.length,
    geographicStations: records.length - countByArea['global-radio'],
    globalProviderStations: countByArea['global-radio'],
    declaredCategory, declaredLanguage,
    contentClassified,
    awaitingContentReview: countByGroup.unknown,
    countByArea, countByGroup,
    notes: [
      'Geography reflects catalog file placement, not station transmitter coordinates.',
      'Content tags are catalog-reported or explicitly reviewed; unknown does not mean general/music.',
      'A genre, audio codec or language is never invented from a station title or its country.',
      'There are no raw media stream URLs, bearer tokens or listener identifiers in this report.',
    ],
  };
  const csvCell = value => {
    const raw = Array.isArray(value) ? value.join('|') : String(value ?? '');
    // Protect spreadsheet viewers against CSV formula injection from catalog titles.
    const safe = /^[\s]*[=+@-]/.test(raw) ? "'" + raw : raw;
    return '"' + safe.replaceAll('"', '""').replace(/[\r\n]/g, ' ') + '"';
  };
  const columns = ['path', 'area', 'country', 'provider', 'title', 'groups',
    'genres', 'language', 'broadcastBand', 'evidence', 'catalogCategory', 'active'];
  const rows = [columns.map(csvCell).join(',')];
  for (const item of records) rows.push(columns.map(key => csvCell(item[key])).join(','));
  await mkdir(dirname(csvOutput), { recursive: true });
  await mkdir(dirname(summaryOutput), { recursive: true });
  await writeFile(csvOutput, rows.join('\n') + '\n');
  await writeFile(summaryOutput, JSON.stringify(summary, null, 2) + '\n');
  return { records, summary };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { summary } = await auditRadioClassification();
  process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
}
