import test from "node:test";
import assert from "node:assert/strict";

import {
  isZingScheduleUrl,
  normalizeScheduleUrl,
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
