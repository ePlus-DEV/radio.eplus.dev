import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const playerFile = join(process.cwd(), "components/player/Player.vue");
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

test("player palette keeps structural surfaces neutral and violet as the primary action accent", async () => {
  const source = await readFile(playerFile, "utf8");

  assert.doesNotMatch(source, /rgba\(56,189,248/);
  assert.match(source, /bg-\[var\(--radio-surface-elevated\)\]/);
  assert.match(source, /bg-violet-600 text-white[\s\S]*hover:bg-violet-500/);
  assert.match(source, /\$t\('player\.pause'\)/);
});

test("player dock is a live radio console, not a cloned music timeline", async () => {
  const source = await readFile(playerFile, "utf8");

  assert.match(source, /radio-player-console/);
  assert.match(source, /radio-player-main-action/);
  assert.match(source, /liveStateLabel/);
  assert.match(source, /activeSourceName/);
  assert.doesNotMatch(
    source,
    /nowPlayingTitle[\s\S]{0,800}<input type="range"[\s\S]{0,800}currentMedia/,
    "the dock should not add a song-progress timeline for live radio",
  );
});
