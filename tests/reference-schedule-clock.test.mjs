import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createReferenceScheduleClock } from '../utils/reference-schedule-clock.mjs';

test('one guide-only reference clock with no global idle wakeups', () => {
  let active = false;
  let seq = 0;
  let ticks = 0;
  const timers = new Map();
  const created = [];
  const removed = [];
  const clock = createReferenceScheduleClock({
    hasReference: () => active,
    onTick: () => { ticks += 1; },
    setTimer: (callback, ms) => {
      assert.equal(ms, 60_000);
      const id = ++seq;
      created.push(id);
      timers.set(id, callback);
      return id;
    },
    clearTimer: id => { removed.push(id); timers.delete(id); },
  });
  clock.sync();
  assert.equal(created.length, 0, 'no timer for stations without a guide');
  active = true;
  clock.sync();
  clock.sync();
  assert.deepEqual(created, [1], 'do not duplicate interval after route or state changes');
  timers.get(1)();
  assert.equal(ticks, 1);
  active = false;
  clock.sync();
  assert.deepEqual(removed, [1]);
  assert.equal(timers.size, 0);
  active = true;
  clock.sync();
  assert.deepEqual(created, [1, 2], 'returning to guide creates one fresh interval');
  clock.stop();
  clock.stop();
  assert.deepEqual(removed, [1, 2], 'teardown is idempotent');
  assert.equal(timers.size, 0);
});

test('global player starts clock only after client mount and cancels it on teardown', async () => {
  const composable = await readFile(new URL('../composables/useStationRealtime.ts', import.meta.url), 'utf8');
  assert.match(composable, /const referenceClock = createReferenceScheduleClock\(/);
  assert.match(composable, /hasReference: \(\) => Boolean\(referenceSchedule\.value\?\.slots\.length\)/);
  assert.match(composable, /watch\(referenceSchedule, \(\) => \{ if \(clientReady\) referenceClock\.sync\(\); \}\)/);
  assert.match(composable, /onMounted\(\(\) => \{\s*clientReady = true;\s*activate\(\);\s*referenceClock\.sync\(\)/);
  assert.match(composable, /onBeforeUnmount\(\(\) => \{[\s\S]*?referenceClock\.stop\(\)/);
  assert.doesNotMatch(composable, /referenceTimer = setInterval/);
});

test('queued reference guide callbacks cannot tick after deactivation or teardown', () => {
  let active = true;
  let ticks = 0;
  let nextId = 0;
  const timers = new Map();
  const clock = createReferenceScheduleClock({
    hasReference: () => active,
    onTick: () => { ticks += 1; },
    setTimer: callback => {
      const id = ++nextId;
      timers.set(id, callback);
      return id;
    },
    clearTimer: id => timers.delete(id),
  });

  clock.sync();
  const stale = timers.get(1);
  stale();
  assert.equal(ticks, 1);

  // The station's reference may disappear before its watcher cancels the timer.
  active = false;
  stale();
  assert.equal(ticks, 1);

  clock.sync();
  stale();
  assert.equal(ticks, 1);

  active = true;
  clock.sync();
  const current = timers.get(2);
  stale(); // Callback queued before clearInterval must not affect a new guide.
  assert.equal(ticks, 1);
  current();
  assert.equal(ticks, 2);

  clock.stop();
  current();
  assert.equal(ticks, 2);
});
