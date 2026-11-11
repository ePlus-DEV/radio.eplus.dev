import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { isCurrentRestoredCountrySelection } from '../utils/restored-country-selection.mjs';

const expected = { generation: 7, pauseRequest: 3, stationUrl: '/asia/viet-nam/vov1' };
const state = {
  ...expected,
  requestedStationUrl: '',
  hasSources: false,
};

test('restored Country Play may resolve only for its original active selection', () => {
  assert.equal(isCurrentRestoredCountrySelection(expected, state), true);
  assert.equal(isCurrentRestoredCountrySelection(expected, { ...state, generation: 8 }), false,
    'a newer queue selection must win');
  assert.equal(isCurrentRestoredCountrySelection(expected, { ...state, requestedStationUrl: '/asia/viet-nam/vov2' }), false,
    'a Country navigation request must win even before the new route loads');
  assert.equal(isCurrentRestoredCountrySelection(expected, { ...state, stationUrl: '/asia/viet-nam/vov2' }), false,
    'a newly active station must not be replaced');
  assert.equal(isCurrentRestoredCountrySelection(expected, { ...state, pauseRequest: 4 }), false,
    'Pause or cancel during the catalog fetch must not trigger a late Play');
  assert.equal(isCurrentRestoredCountrySelection(expected, { ...state, hasSources: true }), false,
    'a route that already restored live sources must not be activated twice');
  assert.equal(isCurrentRestoredCountrySelection(null, state), false);
});

test('Country Session checks stale Play intent before activating and before failed-fetch navigation', async () => {
  const session = await readFile(new URL('../components/player/Session.vue', import.meta.url), 'utf8');
  assert.match(session, /isCurrentRestoredCountrySelection\(intent,/);
  assert.match(session, /if \(!isCurrent\(\)\) return false;/);
  assert.match(session, /if \(resolved \|\| !isCurrent\(\)\) return;/);
  const fetchPosition = session.indexOf('siteAssetUrl(`/radio/${area}/${country}.json`)');
  const guardPosition = session.indexOf('if (!isCurrent()) return false;', fetchPosition);
  const activatePosition = session.indexOf('playback.activate(createPlaybackStation(', fetchPosition);
  assert.ok(fetchPosition >= 0 && guardPosition > fetchPosition && activatePosition > guardPosition,
    'late country fetch must re-check selection before playback.activate');
});
