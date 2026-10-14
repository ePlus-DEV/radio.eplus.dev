import test from "node:test";
import assert from "node:assert/strict";

import {
  isZingScheduleUrl,
  normalizeScheduleUrl,
  schedulePosition,
  referenceScheduleGap,
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

test('16:29 ICT is an unlisted gap before VOV Giao thông TP.HCM 16:30', async () => {
  const { vietnamReferencePrograms } = await import('../utils/vietnam-schedules.mjs');
  const programs = vietnamReferencePrograms('/asia/viet-nam/vov-gt-hcm', new Date('2026-10-14T09:29:00Z'));
  const nowSeconds = Date.parse('2026-10-14T09:29:00Z') / 1000;
  const gap = referenceScheduleGap(programs, nowSeconds);
  assert.deepEqual(gap, {
    insertIndex: 7,
    nextTitle: 'Giờ cao điểm chiều',
    nextStartTime: Date.parse('2026-10-14T09:30:00Z') / 1000,
  });
  assert.deepEqual(schedulePosition(programs, nowSeconds, true), { currentIndex: -1, scrollIndex: 7 });
  assert.equal(referenceScheduleGap(programs, nowSeconds + 60), null,
    '16:30 switches to the actual on-air slot, removing the gap marker');
  assert.deepEqual(schedulePosition(programs, nowSeconds + 60, true), { currentIndex: 7, scrollIndex: 7 });
});

test('unlisted reference gaps include before first, between slots and after last', () => {
  const schedule = [
    { startTime: 100, endTime: 200, title: 'First' },
    { startTime: 300, endTime: 400, title: 'Next' },
  ];
  assert.deepEqual(referenceScheduleGap(schedule, 50),
    { insertIndex: 0, nextTitle: 'First', nextStartTime: 100 });
  assert.equal(referenceScheduleGap(schedule, 150), null);
  assert.deepEqual(referenceScheduleGap(schedule, 250),
    { insertIndex: 1, nextTitle: 'Next', nextStartTime: 300 });
  assert.equal(referenceScheduleGap(schedule, 300), null);
  assert.deepEqual(referenceScheduleGap(schedule, 400),
    { insertIndex: 2, nextTitle: '', nextStartTime: null });
  assert.equal(referenceScheduleGap([], 250), null);
  assert.equal(referenceScheduleGap(null, 250), null);
  assert.equal(referenceScheduleGap(schedule, NaN), null);
});

test('Queue UI scrolls to missing-programme marker, never displays the next show as live', async () => {
  const { readFile } = await import('node:fs/promises');
  const queue = await readFile(new URL('../components/player/Queue.vue', import.meta.url), 'utf8');
  const marker = await readFile(new URL('../components/player/ScheduleGap.vue', import.meta.url), 'utf8');
  assert.match(queue, /scheduleGap\.value\s*\?\s*container\?\.querySelector<HTMLElement>\('\[data-schedule-now\]'\)/);
  assert.match(queue, /scheduleGap\?\.insertIndex === index/);
  assert.match(queue, /scheduleGap\?\.insertIndex === program\.length/);
  assert.match(marker, /data-schedule-now/);
  assert.match(marker, /panel\.schedule_gap_unknown/);
  assert.match(marker, /panel\.schedule_gap_next/);
  assert.doesNotMatch(marker, /player\.live|schedule_loading/);
});
