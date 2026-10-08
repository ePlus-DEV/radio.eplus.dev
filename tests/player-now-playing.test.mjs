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

test("player palette keeps structural surfaces neutral and rose as the primary action accent", async () => {
  const source = await readFile(playerFile, "utf8");

  assert.doesNotMatch(source, /rgba\(56,189,248/);
  assert.match(source, /bg-\[var\(--radio-surface-elevated\)\]/);
  assert.match(source, /bg-rose-500 text-white hover:bg-rose-600/);
  assert.match(source, /\$t\('player\.pause'\)/);
});
