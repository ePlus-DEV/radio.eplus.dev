// Read-only TuneIn track history for the seven known Apple Music Radio stations.
// This never calls AIR's Playing.ashx (a broadcaster WRITE endpoint), includes no
// partner credentials, and does not touch the signed HLS playback URLs.
import { PUBLIC_APPLE_TUNEIN_STATIONS, TUNEIN_CORS_PROXY } from './global-radio-public-tunein.mjs';

const PREFIX = 'tunein-apple-history:';
const MAX_ITEMS = 30;
const MAX_NODES = 120;
const clean = value => typeof value === 'string' ? value.trim().slice(0, 180) : '';

export function appleTuneInStationId(station) {
  if (!station || typeof station.id !== 'string') return '';
  return station.url === '/global-radio/apple-music/' + station.id
    && Object.hasOwn(PUBLIC_APPLE_TUNEIN_STATIONS, station.id) ? station.id : '';
}

export function appleTuneInHistoryMarker(station) {
  const id = appleTuneInStationId(station);
  return id ? PREFIX + id : '';
}

export function stationIdFromTuneInHistoryMarker(marker) {
  const id = typeof marker === 'string' && marker.startsWith(PREFIX)
    ? marker.slice(PREFIX.length) : '';
  return Object.hasOwn(PUBLIC_APPLE_TUNEIN_STATIONS, id) ? id : '';
}

export function buildPublicTuneInHistoryRequest(stationId) {
  const station = PUBLIC_APPLE_TUNEIN_STATIONS[stationId];
  if (!station) return null;
  const upstream = new URL('https://opml.radiotime.com/Browse.ashx');
  upstream.searchParams.set('c', 'playlist');
  upstream.searchParams.set('id', station.tunein);
  upstream.searchParams.set('render', 'json');
  // Same owner-operated CORS relay as Tune.ashx; no arbitrary remote URL input.
  return TUNEIN_CORS_PROXY + '/' + upstream.href;
}

function playedAt(value) {
  const numeric = typeof value === 'number' || /^\d{10,13}$/.test(String(value || ''))
    ? Number(value) : NaN;
  const seconds = numeric > 1e12 ? Math.floor(numeric / 1000) : numeric;
  return Number.isSafeInteger(seconds) && seconds >= 1262304000
    && seconds < 4102444800 ? seconds : 0;
}

function asTrack(node) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return null;
  if (node.commercial === true || node.commercial === 'true') return null;
  const source = node.track && typeof node.track === 'object' ? node.track : node;
  let title = clean(source.track_title || source.song_title || source.title || source.song);
  let artist = clean(source.track_artist || source.artist || source.artistName || source.artists);
  const playing = clean(node.playing);
  // TuneIn's outline.playing field means "Artist - Song"; it represents a
  // current track, not the station's current show/programme label.
  if (playing && (!title || !artist)) {
    const index = playing.indexOf(' - ');
    if (index > 0) {
      artist = clean(playing.slice(0, index));
      title = clean(playing.slice(index + 3));
    }
  }
  const itemType = clean(node.item || node.type || node.element).toLowerCase();
  if (!title && /^(song|track)$/.test(itemType)) title = clean(node.text);
  if (!artist && /^(song|track)$/.test(itemType)) artist = clean(node.subtext);
  // A show title or station slogan is NOT a song. Require both song and artist.
  if (!title || !artist || title.toLowerCase() === artist.toLowerCase()) return null;
  const current = Boolean(playing || node.is_now_playing === true
    || node.is_current === true || node.current === true);
  return {
    track: {
      track_title: title, track_artist: artist, track_image: '',
      track_played: playedAt(source.track_played || source.played_at || source.start_time
        || source.timestamp || node.time),
    },
    current,
  };
}

export function parseTuneInHistory(payload) {
  if (payload?.head?.status != null && Number(payload.head.status) !== 200) {
    throw new Error('unavailable');
  }
  const rows = Array.isArray(payload?.body) ? payload.body : [];
  const pending = rows.slice(0, MAX_NODES);
  const playlist = [];
  const seen = new Set();
  let nowPlaying = null;
  let inspected = 0;
  while (pending.length && inspected++ < MAX_NODES && playlist.length < MAX_ITEMS) {
    const row = pending.shift();
    if (!row || typeof row !== 'object') continue;
    const found = asTrack(row);
    if (found) {
      const { track, current } = found;
      if (current && !nowPlaying) nowPlaying = {
        title: track.track_title, artist: track.track_artist,
      };
      const key = [track.track_title, track.track_artist, track.track_played].join('\u0000');
      if (!seen.has(key)) {
        seen.add(key);
        playlist.push(track);
      }
    }
    if (Array.isArray(row.children)) pending.push(...row.children.slice(0, MAX_NODES - inspected));
  }
  // A provider may return a current song after its history container.
  // Put a positively identified live track first; never label an ordinary
  // history row LIVE merely because it appears at index zero.
  if (nowPlaying) {
    const index = playlist.findIndex(track => track.track_title === nowPlaying.title
      && track.track_artist === nowPlaying.artist);
    if (index > 0) playlist.unshift(playlist.splice(index, 1)[0]);
  }
  return { playlist, nowPlaying };
}

export async function fetchPublicTuneInHistory({ stationId, signal, fetcher = fetch }) {
  const requestUrl = buildPublicTuneInHistoryRequest(stationId);
  if (!requestUrl) throw new Error('invalid_station');
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal?.addEventListener('abort', onAbort, { once: true });
  if (signal?.aborted) controller.abort();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetcher(requestUrl, {
      method: 'GET', cache: 'no-store', credentials: 'omit',
      headers: { Accept: 'application/json' }, signal: controller.signal,
    });
    if (!response?.ok) throw new Error('unavailable');
    return parseTuneInHistory(await response.json());
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', onAbort);
  }
}
