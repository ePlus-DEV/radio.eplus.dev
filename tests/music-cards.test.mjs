import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("music cards use responsive square artwork without removing navigation", async () => {
  const css = await readFile("assets/css/main.css", "utf8");
  for (const [file, artClass, focusClass] of [
    ["components/panel/Radio.vue", "radio-card-compact-country-art", "radio-card-compact-country"],
    ["components/panel/Station.vue", "radio-card-compact-station-art", "radio-card-compact-station-link"],
  ]) {
    const source = await readFile(file, "utf8");
    assert.match(source, /radio-station-card/);
    assert.ok(source.includes(artClass), file + " keeps the same responsive artwork");
    assert.ok(source.includes(focusClass), file + " keeps focus styling");
    assert.match(source, /<NuxtLink/);
    assert.match(source, /loading="lazy"/);
  }
  assert.match(css, /\\.radio-card-compact-country-art\\s*\\{[^}]*sm:aspect-\\[5\\/4\\][^}]*lg:aspect-square/);
  assert.match(css, /\\.radio-card-compact-station-art\\s*\\{[^}]*sm:aspect-square/);
  assert.match(css, /focus-visible:ring-rose-500/);
});

test("music cards respect both semantic color tokens and reduced motion preferences", async () => {
  const css = await readFile("assets/css/main.css", "utf8");
  assert.match(css, /\.radio-station-card\s*\{/);
  assert.match(css, /background:\s*var\(--radio-surface\)/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
