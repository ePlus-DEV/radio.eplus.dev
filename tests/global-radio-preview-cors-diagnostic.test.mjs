// Preview-only CORS/stream smoke probe. Never log URL, stream accessKey or provider body.
import test from 'node:test';
import { buildPublicTuneInRequest, inspectPublicAppleStream } from '../utils/global-radio-public-tunein.mjs';

const preview = process.env.ONAIR_PR_PREVIEW === 'true' &&
  process.env.GITHUB_ACTIONS === 'true' &&
  process.env.GITHUB_HEAD_REF === 'feat/tunein-apple-radio-song-history-20261105';
const origin = 'https://preview.radio.eplus.dev';
const cors = process.env.NUXT_PUBLIC_CORS_SERVER_1 || '';
const stations = ['apple-music-1', 'apple-music-holiday-hits'];

test('diagnostic only: browser-Origin proxy and live stream resolution for preview', {
  skip: !preview, timeout: 30000,
}, async () => {
  for (const stationId of stations) {
    const url = buildPublicTuneInRequest(stationId, cors);
    const report = { stationId };
    if (!url) {
      report.result = 'config_missing_or_invalid';
      console.log('APPLE_PREVIEW_CORS_PROBE', JSON.stringify(report));
      continue;
    }
    try {
      const res = await fetch(url, {
        method: 'GET', redirect: 'error', cache: 'no-store', credentials: 'omit',
        headers: { Origin: origin, Accept: 'application/json' },
        signal: AbortSignal.timeout(11000),
      });
      const allow = res.headers.get('access-control-allow-origin') || '';
      report.httpStatus = res.status;
      report.corsAllowed = allow === '*' || allow === origin;
      if (res.ok) {
        const length = Number(res.headers.get('content-length') || 0);
        if (length > 262144) {
          report.result = 'oversized_response';
          await res.body?.cancel().catch(() => {});
        } else {
          const bytes = await res.arrayBuffer();
          if (bytes.byteLength > 262144) report.result = 'oversized_response';
          else {
            try {
              const payload = JSON.parse(new TextDecoder().decode(bytes));
              const options = Array.isArray(payload?.body) ? payload.body : [];
              report.providerOk = payload?.head?.status == null || Number(payload.head.status) === 200;
              report.candidates = Math.min(options.length, 50);
              report.validStream = options.some(x =>
                Boolean(inspectPublicAppleStream(x?.url, stationId)));
            } catch { report.result = 'invalid_json'; }
          }
        }
      }
    } catch (e) {
      report.result = ['TimeoutError', 'AbortError'].includes(e?.name) ?
        'timeout' : 'network_or_redirect_error';
    }
    console.log('APPLE_PREVIEW_CORS_PROBE', JSON.stringify(report));
  }
});
