import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const playerFile = join(process.cwd(), "components/player/Player.vue");
const stationPage = join(
  process.cwd(),
  "pages/[area]/[country]/[station].vue",
);

test("player does not duplicate current song below the main now-playing area", async () => {
  const source = await readFile(playerFile, "utf8");

  assert.doesNotMatch(
    source,
    /v-if="song\?\.currentMedia"[\s\S]{0,1200}Now playing/,
    "currentMedia should not be rendered twice in the player",
  );

  assert.match(source, /v-if="song\?\.nextMedia\?\.title"/);
  assert.match(source, /\$t\("panel\.next"\)/);
  assert.match(source, /song\.nextMedia\.title/);
  assert.match(source, /song\.nextMedia\.artists/);
});

test("player palette keeps structural surfaces neutral and rose as the primary action accent", async () => {
  const source = await readFile(playerFile, "utf8");

  assert.doesNotMatch(source, /rgba\(56,189,248/);
  assert.match(
    source,
    /bg-\[radial-gradient\(circle_at_top_left,rgba\(244,63,94,0\.07\),transparent_48%\)\]/,
  );

  const pauseIndex = source.indexOf('aria-label="Pause radio"');
  assert.ok(pauseIndex > 0);
  const pauseBlock = source.slice(Math.max(0, pauseIndex - 700), pauseIndex + 100);
  assert.match(pauseBlock, /bg-rose-500/);
  assert.doesNotMatch(pauseBlock, /bg-\[var\(--radio-inverse-bg\)\]/);
});

test("station detail keeps nextMedia from the Zing detail response", async () => {
  const source = await readFile(stationPage, "utf8");

  assert.match(source, /nextMedia\?: CurrentMedia/);
  assert.match(source, /thumbnail\?: string/);
});
