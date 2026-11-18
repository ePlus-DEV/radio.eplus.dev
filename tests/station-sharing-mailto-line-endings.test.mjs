import test from 'node:test';
import assert from 'node:assert/strict';
import { stationReportEmailUrl } from '../utils/station-sharing.mjs';

test('mailto body normalizes mixed CRLF, CR and LF to single CRLF', () => {
  const url = stationReportEmailUrl(
    '/vn/ho-chi-minh/test-radio',
    'Test Radio',
    'Playback problem',
    'First line\r\nSecond line\rThird line\nFourth line',
  );
  assert.ok(url.startsWith('mailto:report@eplus.dev?'));
  const encodedBody = url.split('&body=')[1];
  const body = decodeURIComponent(encodedBody);
  assert.equal(
    body,
    'First line\r\nSecond line\r\nThird line\r\nFourth line\r\n\r\nTest Radio\r\nhttps://radio.eplus.dev/vn/ho-chi-minh/test-radio',
  );
  assert.equal((body.match(/\r\n/g) || []).length, 6);
  assert.equal(body.replace(/\r\n/g, '').includes('\r'), false);
});
