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


test('mailto expands a single localized placeholder without leaking literal braces or duplicating station details', () => {
  const stationOnly = new URL(stationReportEmailUrl(
    '/vn/ho-chi-minh/test-radio', 'Test Radio', 'Playback problem', 'Station: {station}',
  ));
  const urlOnly = new URL(stationReportEmailUrl(
    '/vn/ho-chi-minh/test-radio', 'Test Radio', 'Playback problem', 'Station page: {url}',
  ));
  const stationBody = stationOnly.searchParams.get('body');
  const urlBody = urlOnly.searchParams.get('body');
  assert.equal(stationBody, 'Station: Test Radio\r\nhttps://radio.eplus.dev/vn/ho-chi-minh/test-radio');
  assert.equal(urlBody, 'Station page: https://radio.eplus.dev/vn/ho-chi-minh/test-radio\r\nTest Radio');
  assert.doesNotMatch(stationBody + urlBody, /\\{(?:station|url)\\}/);
});
