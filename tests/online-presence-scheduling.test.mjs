import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  ONLINE_PRESENCE_CHECKPOINT_MS,
  ONLINE_STATS_PREVIEW_MS,
  onlinePresenceTickInterval,
} from '../utils/online-presence-timer.mjs';

test('ordinary foreground tracking checks in at 5s, only active stats need 1s', () => {
  assert.equal(ONLINE_PRESENCE_CHECKPOINT_MS, 5_000);
  assert.equal(ONLINE_STATS_PREVIEW_MS, 1_000);
  assert.equal(onlinePresenceTickInterval({ eligible: true }), 5_000);
  assert.equal(onlinePresenceTickInterval({ eligible: true, statsVisible: true }), 1_000);
});

test('offline, background, disabled or idle presence runs no global timer', () => {
  assert.equal(onlinePresenceTickInterval(), 0);
  assert.equal(onlinePresenceTickInterval({ eligible: false, statsVisible: true }), 0);
  assert.equal(onlinePresenceTickInterval({ eligible: true, idle: true }), 0);
  assert.equal(onlinePresenceTickInterval({ eligible: true, idle: true, statsVisible: true }), 0);
});

test('global timer reacts to focus, visibility, navigation and user activity', async () => {
  const source = await readFile(new URL('../composables/useOnlinePresence.ts', import.meta.url), 'utf8');
  assert.match(source, /document\.visibilityState === 'visible'/);
  assert.match(source, /document\.hasFocus\(\)/);
  assert.match(source, /online\.enabled && navigator\.onLine/);
  assert.match(source, /route\.hash === '#stats'/);
  assert.match(source, /watch\(\(\) => \[route\.path, route\.hash\], sync/);
  assert.match(source, /window\.setInterval\(tick, delay\)/);
  assert.match(source, /if \(delay === tickDelay\) return/);
  assert.match(source, /window\.clearInterval\(timer\)/);
  assert.match(source, /window\.addEventListener\('pagehide', onPageHide\)/);
  assert.match(source, /window\.addEventListener\('pageshow', onForeground\)/);
  assert.match(source, /window\.addEventListener\('radio:online-duration-reset', reset\)/);
  assert.match(source, /tracker\.activity\(\);\s*\/\/[^\n]*\n\s*schedule\(\)/);
  assert.match(source, /tracker\.flush\(\)/);
  assert.match(source, /stopRouteWatch\(\)/);
  assert.doesNotMatch(source, /window\.setInterval\(tick, 1000\)/);
});
