/**
 * Conservative, source-attributed radio classification.
 *
 * The geographic route is authoritative for catalog organization. Subject
 * groups are assigned only from explicit catalog metadata or reviewed
 * exceptions; a station's title, country, URL and codec never imply a genre.
 * "unknown" is an intentional outcome, not a guess at general/music.
 */
export const RADIO_CONTENT_GROUPS = Object.freeze([
  'music', 'news', 'talk', 'sports', 'traffic', 'culture',
  'education', 'community', 'international', 'health', 'kids',
  'religion', 'entertainment', 'unknown',
]);
export const RADIO_AREAS = Object.freeze([
  'africa', 'asia', 'central-america', 'europe',
  'north-america', 'oceania', 'south-america', 'global-radio',
]);

const normalize = value => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd').replace(/Đ/g, 'D')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const categoryGroups = new Map([
  ['thoi su', 'news'],
  ['van hoa xa hoi', 'culture'],
  ['am nhac', 'music'],
  ['ban dan toc', 'community'],
  ['ban doi ngoai', 'international'],
  ['ban van hoc nghe thuat', 'culture'],
  ['giao thong', 'traffic'],
  ['sport', 'sports'],
  ['sports', 'sports'],
  ['news', 'news'],
  ['talk', 'talk'],
  ['traffic', 'traffic'],
  ['music', 'music'],
]);

const explicitContentTags = new Map([
  ['news', ['news']], ['world news', ['news']], ['local news', ['news']],
  ['news talk', ['news', 'talk']], ['political talk', ['talk']],
  ['talk', ['talk']], ['talk radio', ['talk']],
  ['sport', ['sports']], ['sports', ['sports']], ['sports talk', ['sports', 'talk']],
  ['traffic', ['traffic']], ['giao thong', ['traffic']],
  ['education', ['education']], ['educational', ['education']],
  ['culture', ['culture']], ['arts', ['culture']], ['drama', ['culture']],
  ['community radio', ['community']],
  ['children', ['kids']], ['kids', ['kids']], ['children s', ['kids']],
  ['health', ['health']], ['healthcare', ['health']],
  ['religion', ['religion']], ['religious', ['religion']],
  ['comedy', ['entertainment']], ['entertainment', ['entertainment']],
  ['music', ['music']], ['pop music', ['music']],
]);

const genreAliases = new Map([
  ['pop', 'pop'], ['pop music', 'pop'], ['indie pop', 'pop'],
  ['rock', 'rock'], ['classic rock', 'rock'], ['pop rock', 'rock'],
  ['alternative rock', 'rock'], ['blues rock', 'rock'],
  ['punk rock', 'rock'], ['punk', 'rock'], ['ska', 'rock'],
  ['jazz', 'jazz'], ['smooth jazz', 'jazz'], ['classical', 'classical'],
  ['electronic', 'electronic'], ['electronica', 'electronic'],
  ['edm', 'electronic'], ['techno', 'electronic'],
  ['dance', 'dance'], ['club', 'dance'], ['trance', 'trance'],
  ['house', 'house'], ['hiphop', 'hiphop'], ['hip hop', 'hiphop'],
  ['rap', 'hiphop'], ['metal', 'metal'], ['heavy metal', 'metal'],
  ['folk', 'folk'], ['folklore', 'folk'], ['country', 'country'],
  ['latin', 'latin'], ['chill', 'chill'], ['chillout', 'chill'],
  ['relaxing', 'chill'], ['acoustic', 'acoustic'], ['indie', 'indie'],
  ['oldies', 'oldies'], ['classic hits', 'oldies'],
  ['soul', 'soul'], ['classic soul', 'soul'], ['funk', 'funk'],
  ['blues', 'blues'], ['reggae', 'reggae'], ['gospel', 'gospel'],
  ['hits', 'hits'], ['holiday', 'holiday'],
  ['contemporary', 'contemporary'], ['adult contemporary', 'contemporary'],
  ['hot adult contemporary', 'contemporary'],
  ['instrumental', 'instrumental'],
]);

// Hand-reviewed exceptions from the supplied catalog descriptions. They
// correct misleading category values; no blanket name-based inference.
const reviewedExceptions = new Map([
  ['/asia/viet-nam/vov-english', ['international']],
  ['/asia/viet-nam/vov-247', ['international']],
  ['/asia/viet-nam/vov-mekong', ['community']],
  ['/asia/viet-nam/vov-suc-khoe', ['health']],
  ['/asia/viet-nam/nhac-thieu-nhi-zing-mp3', ['music', 'kids']],
]);
// These original labels are demonstrably the broadcaster name or conflict
// with the station's presentation, not an evidence-backed genre.
const misleadingCatalogLabels = new Set([
  '/europe/united-kingdom/talk',
  '/europe/united-kingdom/bbc-glasgow',
  '/europe/united-kingdom/fun-radio-uk',
]);

function catalogTagList(description) {
  if (typeof description !== 'string') return [];
  const raw = description.trim();
  if (!raw || raw.length > 220 || /[.!?\n\r]/.test(raw)) return [];
  // Imported concise tags are comma-separated; single strings are accepted
  // only if the entire value is an already-known tag.
  const tags = raw.split(',').map(normalize).filter(Boolean);
  if (tags.length > 1 && tags.every(tag => tag.length <= 48)) return tags;
  if (tags.length === 1 && (explicitContentTags.has(tags[0]) || genreAliases.has(tags[0]))) return tags;
  return [];
}

function safeLanguage(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  // Only explicitly declared languages, never a country-to-language guess.
  return trimmed.length <= 60 && !/[\u0000-\u001f<>{}]/.test(trimmed) ? trimmed : '';
}

export function classifyRadioContent(station, { path = '', providerGenre = '' } = {}) {
  const groups = new Set();
  const genres = new Set();
  const evidence = new Set();
  const addGroup = (group, source) => {
    if (!RADIO_CONTENT_GROUPS.includes(group) || group === 'unknown') return;
    groups.add(group);
    evidence.add(source);
  };
  const exception = reviewedExceptions.get(path);
  if (exception) {
    for (const group of exception) addGroup(group, 'reviewed-catalog');
  } else if (!misleadingCatalogLabels.has(path)) {
    const group = categoryGroups.get(normalize(station?.category));
    if (group) addGroup(group, 'catalog-category');
  }
  const tags = catalogTagList(station?.description);
  const providerTag = normalize(providerGenre);
  if (providerTag && (explicitContentTags.has(providerTag) || genreAliases.has(providerTag))) tags.push(providerTag);
  for (const tag of tags) {
    const source = tag === providerTag ? 'provider-genre' : 'catalog-tags';
    for (const group of explicitContentTags.get(tag) || []) addGroup(group, source);
    const genre = genreAliases.get(tag);
    if (genre) {
      genres.add(genre);
      addGroup('music', source);
    }
  }
  return {
    groups: groups.size ? RADIO_CONTENT_GROUPS.filter(group => groups.has(group)) : ['unknown'],
    genres: [...genres].sort(),
    language: safeLanguage(station?.language),
    evidence: [...evidence].sort(),
  };
}

export function radioBroadcastBand(station) {
  const text = typeof station?.signal === 'string' ? station.signal : '';
  if (/\bFM\b/i.test(text)) return 'fm';
  if (/\bAM\b/i.test(text)) return 'am';
  return 'unknown';
}

export function stationClassificationRecord(path, station, providerGenre = '') {
  const match = /^\/([^/]+)\/([^/]+)\/([^/]+)$/.exec(path);
  if (!match || !RADIO_AREAS.includes(match[1])) throw new Error('Invalid station path');
  const classified = classifyRadioContent(station, { path, providerGenre });
  return {
    path,
    area: match[1],
    country: match[2],
    title: String(station?.title || '').trim(),
    groups: classified.groups,
    genres: classified.genres,
    language: classified.language,
    broadcastBand: radioBroadcastBand(station),
    evidence: classified.evidence,
    catalogCategory: typeof station?.category === 'string' ? station.category.trim() : '',
    active: station?.disabled !== true && station?.active !== false,
  };
}
