import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const stationPage = join(
  process.cwd(),
  "pages/[area]/[country]/[station].vue",
);

test("station realtime providers never run during SSR/prerender", async () => {
  const source = await readFile(stationPage, "utf8");

  for (const fn of ["fetchLyric", "fetchDetail", "fetchSchedule", "pollSchedule"]) {
    const start = source.indexOf(`const ${fn}`);
    assert.notEqual(start, -1, `${fn} not found`);

    const block = source.slice(start, start + 500);
    assert.match(
      block,
      /if \(!import\.meta\.client(?: \|\| !clientReady)?\) return;/,
      `${fn} must explicitly refuse server execution`,
    );
  }

  assert.match(source, /let clientReady = false;/);
  assert.match(source, /onMounted\(\(\) => \{\s*clientReady = true;/s);
  assert.match(source, /startStationRealtime\(meta, version\)/);
});

test("station prerender keeps static metadata activation separate from realtime polling", async () => {
  const source = await readFile(stationPage, "utf8");

  const start = source.indexOf("const activateStation");
  const end = source.indexOf("watch(", start);
  const block = source.slice(start, end);

  assert.match(block, /streamName\.value = meta\.title/);
  assert.match(block, /setStationStreams\(/);
  assert.match(block, /startStationRealtime\(meta, version\)/);
  assert.doesNotMatch(
    block,
    /void pollSchedule\(/,
    "activateStation should delegate realtime work instead of polling directly",
  );
});
