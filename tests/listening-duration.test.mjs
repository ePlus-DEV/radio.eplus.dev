import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LISTENING_DURATION_KEY,
  MAX_LISTENING_GAP_MS,
  addListeningDuration,
  createListeningDurationTracker,
  emptyListeningDuration,
  localDayKey,
  parseListeningDuration,
} from '../utils/listening-duration.mjs';

const station = (id) => ({ url: `/europe/united-kingdom/${id}`, title: id, image: '/brand/onair-mark.svg' });

test('duration statistics accumulate only actual playback, independently of history and favorites', () => {
  assert.equal(LISTENING_DURATION_KEY, 'radio_listening_duration_v1');
  let data = emptyListeningDuration();
  data = addListeningDuration(data, station('heart-uk'), 32_000, '2026-10-14');
  data = addListeningDuration(data, station('heart-uk'), 8_000, '2026-10-14');
  data = addListeningDuration(data, station('bbc'), 12_000, '2026-10-14');
  assert.equal(data.totalMs, 52_000);
  assert.equal(data.todayMs, 52_000);
  assert.equal(data.byStation['/europe/united-kingdom/heart-uk'].ms, 40_000);
  assert.equal(data.byStation['/europe/united-kingdom/bbc'].ms, 12_000);
  const nextDay = addListeningDuration(data, station('heart-uk'), 5_000, '2026-10-15');
  assert.equal(nextDay.totalMs, 57_000);
  assert.equal(nextDay.todayMs, 5_000);
  assert.equal(nextDay.todayKey, '2026-10-15');
  assert.deepEqual(parseListeningDuration(JSON.stringify(nextDay)), nextDay);
  assert.deepEqual(parseListeningDuration('{broken json'), emptyListeningDuration());
  assert.equal(addListeningDuration(data, { ...station('x'), url: 'https://evil.example' }, 5_000), data);
  assert.match(localDayKey(new Date(2026, 9, 14)), /^2026-10-14$/);
});

test('duration tracker pauses during waiting, resume and stream switch, and reports in batches', () => {
  let now = 0;
  const commits = [];
  const reports = [];
  const tracker = createListeningDurationTracker({
    now: () => now,
    onDuration: (target, ms) => commits.push([target.url, ms]),
    onReport: (target, ms) => reports.push([target.url, ms]),
  });
  tracker.start(station('heart-uk'));
  now = 5_000;
  tracker.flush(); // heartbeat
  now = 10_000;
  tracker.stop(); // pause or waiting
  now = 40_000;
  tracker.flush(); // paused duration is excluded
  tracker.start(station('heart-uk')); // resume
  now = 70_000;
  tracker.flush();
  now = 72_000;
  tracker.start(station('bbc')); // station switch flushes old
  now = 77_000;
  tracker.stop();

  assert.deepEqual(commits, [
    ['/europe/united-kingdom/heart-uk', 5_000],
    ['/europe/united-kingdom/heart-uk', 5_000],
    ['/europe/united-kingdom/heart-uk', 30_000],
    ['/europe/united-kingdom/heart-uk', 2_000],
    ['/europe/united-kingdom/bbc', 5_000],
  ]);
  assert.deepEqual(reports, [
    ['/europe/united-kingdom/heart-uk', 10_000],
    ['/europe/united-kingdom/heart-uk', 30_000],
    ['/europe/united-kingdom/heart-uk', 2_000],
    ['/europe/united-kingdom/bbc', 5_000],
  ]);
  assert.equal(tracker.activeUrl, '');
});

test('duration tracker ignores duplicate playing and caps unusually long sleep gaps', () => {
  let now = 100;
  const elapsed = [];
  const tracker = createListeningDurationTracker({ now: () => now, onDuration: (_station, ms) => elapsed.push(ms) });
  tracker.start(station('heart-uk'));
  now = 5_000;
  tracker.start(station('heart-uk')); // duplicate media playing event must not reset the clock
  now = 900_000;
  tracker.stop();
  // A normal 15-minute listening session must not be clipped by the 6h cap.
  assert.deepEqual(elapsed, [899_900]);

  // A much longer missing checkpoint is capped to guard unusual sleep gaps.
  tracker.start(station('heart-uk'));
  now += MAX_LISTENING_GAP_MS + 60_000;
  tracker.stop();
  assert.deepEqual(elapsed, [899_900, MAX_LISTENING_GAP_MS]);
});
