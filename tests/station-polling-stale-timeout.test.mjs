import test from 'node:test';
import assert from 'node:assert/strict';
import { createStationPolling } from '../utils/station-polling.mjs';

const tick = () => new Promise(resolve => setImmediate(resolve));

test('a queued timeout cannot fetch again after polling stops', async () => {
  const jobs = [];
  const calls = [];
  const polling = createStationPolling({
    load: async url => { calls.push(url); return url; },
    onData: () => {}, onLoading: () => {},
    setTimer: callback => { jobs.push(callback); return jobs.length; },
    clearTimer: () => {},
  });
  polling.start('station-a');
  await tick();
  assert.deepEqual(calls, ['station-a']);
  const queued = jobs[0];
  polling.stop();
  await queued();
  assert.deepEqual(calls, ['station-a']);
  assert.equal(jobs.length, 1);
});

test('a queued timeout from the old station cannot fetch after a station switch', async () => {
  const jobs = [];
  const calls = [];
  const polling = createStationPolling({
    load: async url => { calls.push(url); return url; },
    onData: () => {}, onLoading: () => {},
    setTimer: callback => { jobs.push(callback); return jobs.length; },
    clearTimer: () => {},
  });
  polling.start('station-a');
  await tick();
  const queued = jobs[0];
  polling.start('station-b');
  await tick();
  await queued();
  assert.deepEqual(calls, ['station-a', 'station-b']);
  polling.stop();
});
