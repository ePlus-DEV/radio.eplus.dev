import { stationIdentity } from './listening-library.mjs';
import { parseLibraryStationPath } from './library-card-playback.mjs';

export const COLLECTIONS_KEY = 'radio:personal-collections:v1';
export const COLLECTIONS_LIMIT = 40;
export const COLLECTION_STATIONS_LIMIT = 200;
// 40 collections × 200 URLs × 200 ASCII characters plus JSON overhead fits.
export const COLLECTIONS_FILE_LIMIT = 2 * 1024 * 1024;

function safeName(value) {
  if (typeof value !== 'string') return '';
  const name = value.trim();
  return name.length <= 80 ? name : '';
}
function safeStation(value) {
  const station = stationIdentity(value);
  return station && station.url.length <= 200 && parseLibraryStationPath(station.url) && !station.url.startsWith('/global-radio/') ? station : null;
}
function normalizeCollection(value) {
  const name = safeName(value?.name);
  if (!name || typeof value?.id !== 'string' || !/^[a-zA-Z0-9-]{1,80}$/.test(value.id) || !Array.isArray(value.stations)
    || value.stations.length > COLLECTION_STATIONS_LIMIT || !value.stations.every(safeStation)) return null;
  const seen = new Set();
  const stations = value.stations.flatMap(value => {
    const station = safeStation(value);
    if (!station || seen.has(station.url)) return [];
    seen.add(station.url);
    return [station];
  }).slice(0, COLLECTION_STATIONS_LIMIT);
  return { id: value.id, name, stations };
}
export function parseCollections(raw) {
  if (raw == null) return [];
  let value;
  try { value = JSON.parse(raw); } catch { throw new Error('Invalid collection data'); }
  if (value?.version !== 1 || !Array.isArray(value.collections) || value.collections.length > COLLECTIONS_LIMIT) throw new Error('Invalid collection data');
  const seen = new Set();
  return value.collections.map(collection => {
    const result = normalizeCollection(collection);
    if (!result || seen.has(result.id)) throw new Error('Invalid collection data');
    seen.add(result.id);
    return result;
  });
}
export function serializeCollections(collections) {
  return JSON.stringify({ version: 1, collections });
}
export function addCollectionStation(collection, value) {
  const station = safeStation(value);
  if (!station || collection.stations.length >= COLLECTION_STATIONS_LIMIT || collection.stations.some(s => s.url === station.url)) return collection;
  return { ...collection, stations: [...collection.stations, station] };
}
export function moveCollectionStation(collection, index, direction) {
  const next = index + direction;
  if (!Number.isInteger(index) || ![-1, 1].includes(direction) || index < 0 || next < 0 || index >= collection.stations.length || next >= collection.stations.length) return collection;
  const stations = [...collection.stations];
  [stations[index], stations[next]] = [stations[next], stations[index]];
  return { ...collection, stations };
}
export function exportCollections(collections) {
  return JSON.stringify({ format: 'eplus-onair-collections', version: 1,
    collections: collections.map(({ name, stations }) => ({ name, stations: stations.map(s => s.url) })) }, null, 2);
}
export function parseCollectionsFile(raw) {
  if (typeof raw !== 'string' || new TextEncoder().encode(raw).length > COLLECTIONS_FILE_LIMIT) throw new Error('Invalid collection file');
  const value = JSON.parse(raw);
  if (value?.format !== 'eplus-onair-collections' || value.version !== 1 || !Array.isArray(value.collections) || value.collections.length > COLLECTIONS_LIMIT) throw new Error('Invalid collection file');
  return value.collections.map(collection => {
    const name = safeName(collection?.name);
    if (!name || !Array.isArray(collection.stations) || collection.stations.length > COLLECTION_STATIONS_LIMIT || !collection.stations.every(url => typeof url === 'string' && safeStation({ url, title: 'station' }))) throw new Error('Invalid collection file');
    return { name, stations: [...new Set(collection.stations)] };
  });
}
