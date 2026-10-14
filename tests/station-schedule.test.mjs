import test from "node:test";
import assert from "node:assert/strict";

import {
  isZingScheduleUrl,
  normalizeScheduleUrl,
  schedulePosition,
} from "../utils/station-schedule.mjs";

test("normalizes only real HTTP schedule URLs", () => {
  assert.equal(
    normalizeScheduleUrl(" https://example.com/schedule?time= "),
    "https://example.com/schedule?time=",
  );
  assert.equal(normalizeScheduleUrl(true), "");
  assert.equal(normalizeScheduleUrl(false), "");
  assert.equal(normalizeScheduleUrl(""), "");
  assert.equal(normalizeScheduleUrl("schedule-only"), "");
});

test("detects Zing schedule by provider endpoint instead of country", () => {
  assert.equal(
    isZingScheduleUrl(
      "https://zing.eplus.dev/api/live-stream-program-list?id=IWZ9799A&time=",
    ),
    true,
  );
  assert.equal(
    isZingScheduleUrl("https://hncaching.tek4tv.vn/api/Playlist/json/FM96_"),
    false,
  );
  assert.equal(
    isZingScheduleUrl("https://example.com/api/live-stream-program-list?id=x"),
    false,
  );
});

test('reference schedule focuses current programme at exact interval boundaries', () => {
  const schedule = [
    { startTime: 100, endTime: 200, title: 'Morning' },
    { startTime: 220, endTime: 400, title: 'Noon' },
    { startTime: 500, endTime: 700, title: 'Afternoon' },
  ];
  assert.deepEqual(schedulePosition(schedule, 100, true), { currentIndex: 0, scrollIndex: 0 });
  assert.deepEqual(schedulePosition(schedule, 199, true), { currentIndex: 0, scrollIndex: 0 });
  assert.deepEqual(schedulePosition(schedule, 220, true), { currentIndex: 1, scrollIndex: 1 });
  assert.deepEqual(schedulePosition(schedule, 399, true), { currentIndex: 1, scrollIndex: 1 });
  assert.deepEqual(schedulePosition(schedule, 500, true), { currentIndex: 2, scrollIndex: 2 });
  assert.deepEqual(schedulePosition(schedule, 700, true), { currentIndex: -1, scrollIndex: 2 });
});

test('schedule gaps scroll to nearest upcoming programme without falsely marking it live', () => {
  const schedule = [
    { startTime: 100, endTime: 200 },
    { startTime: 300, endTime: 400 },
    { startTime: 600, endTime: 900 },
  ];
  assert.deepEqual(schedulePosition(schedule, 0, true), { currentIndex: -1, scrollIndex: 0 });
  assert.deepEqual(schedulePosition(schedule, 250, true), { currentIndex: -1, scrollIndex: 1 });
  assert.deepEqual(schedulePosition(schedule, 500, true), { currentIndex: -1, scrollIndex: 2 });
  assert.deepEqual(schedulePosition(schedule, 999, true), { currentIndex: -1, scrollIndex: 2 });
  assert.deepEqual(schedulePosition([], 350, true), { currentIndex: -1, scrollIndex: -1 });
  assert.deepEqual(schedulePosition(null, 350, true), { currentIndex: -1, scrollIndex: -1 });
});

test('legacy remote schedule keeps the provider first programme convention', () => {
  const schedule = [{ title: 'Provider now' }, { title: 'Later' }];
  assert.deepEqual(schedulePosition(schedule, 1234, false), { currentIndex: 0, scrollIndex: 0 });
});
