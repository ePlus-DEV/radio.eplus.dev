// A one-PR, read-only provider diagnostic. It MUST NOT log TuneIn's
// provider body, HLS URL, accessKey, user credentials or other session data.
// CI diagnostics are informational: metadata availability is not guaranteed.
import test from 'node:test';
import { PUBLIC_APPLE_TUNEIN_STATIONS } from '../utils/global-radio-public-tunein.mjs';
import {
  buildPublicTuneInMetadataRequest, parseTuneInStationMetadata,
} from '../utils/global-radio-tunein-metadata.mjs';

const PROBE_BRANCH = 'feat/tunein-apple-radio-song-history-20261105';
const enabled = process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_HEAD_REF === PROBE_BRANCH;

function summarize(payload, stationId) {
  const nodes = Array.isArray(payload?.body) ? [...payload.body.slice(0, 24)] : [];
  const fieldNames = new Set();
  let inspected = 0;
  while (nodes.length && inspected++ < 48) {
    const node = nodes.shift();
    if (!node || typeof node !== 'object' || Array.isArray(node)) continue;
    for (const key of ['element', 'guide_id', 'preset_id', 'current_song',
      'current_artist', 'has_song', 'publish_song', 'children', 'station']) {
      if (Object.hasOwn(node, key)) fieldNames.add(key);
    }
    if (Array.isArray(node.children)) nodes.push(...node.children.slice(0, 16));
    if (node.station && typeof node.station === 'object') nodes.push(node.station);
  }
  const result = parseTuneInStationMetadata(payload, stationId);
  return {
    song: Boolean(result?.title),
    artist: Boolean(result?.artist),
    fields: [...fieldNames].sort(),
    entries: Array.isArray(payload?.body) ? payload.body.length : 0,
    providerStatus: payload?.head?.status == null ? 'missing' : String(payload.head.status).slice(0, 4),
  };
}

test('diagnostic only: live TuneIn Describe metadata availability for seven Apple stations', {
  skip: !enabled,
}, async () => {
  for (const stationId of Object.keys(PUBLIC_APPLE_TUNEIN_STATIONS)) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6_000);
    try {
      const response = await fetch(buildPublicTuneInMetadataRequest(stationId), {
        method: 'GET', cache: 'no-store', credentials: 'omit',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) {
        console.log('TUNEIN_METADATA_PROBE', JSON.stringify({ stationId, status: response.status, result: 'http_error' }));
        continue;
      }
      // Explicit byte cap and no raw provider-body logging.
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > 256 * 1024) {
        console.log('TUNEIN_METADATA_PROBE', JSON.stringify({ stationId, result: 'oversized' }));
        continue;
      }
      const payload = JSON.parse(new TextDecoder().decode(buffer));
      console.log('TUNEIN_METADATA_PROBE', JSON.stringify({
        stationId, status: response.status, result: 'ok', ...summarize(payload, stationId),
      }));
    } catch (error) {
      const result = error?.name === 'AbortError' ? 'timeout' : 'unavailable_or_unparseable';
      console.log('TUNEIN_METADATA_PROBE', JSON.stringify({ stationId, result }));
    } finally {
      clearTimeout(timeout);
    }
  }
});
