import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const file = join(process.cwd(), "components/player/Queue.vue");

test("schedule sidebar keeps rose as an accent instead of a structural fill", async () => {
  const source = await readFile(file, "utf8");

  assert.doesNotMatch(
    source,
    /tab-active !bg-rose-500 !text-white/,
    "active tabs should use the themed surface, not a full rose fill",
  );
  assert.doesNotMatch(
    source,
    /index === 0\s*\? 'bg-rose-500\/10 ring-1 ring-inset ring-rose-500\/15'/,
    "current schedule rows should not look like an alert/error block",
  );

  assert.match(
    source,
    /tab-active !bg-\[var\(--radio-surface\)\]/,
  );
  assert.match(
    source,
    /absolute inset-y-2 left-0 w-0\.5 rounded-full bg-rose-500/,
  );
  assert.match(
    source,
    /bg-\[var\(--radio-surface-soft\)\] ring-1 ring-inset ring-\[var\(--radio-border\)\]/,
  );
});

test("schedule time block uses structural theme tokens", async () => {
  const source = await readFile(file, "utf8");

  assert.match(
    source,
    /rounded-lg bg-\[var\(--radio-surface\)\][^"]*text-\[var\(--radio-text\)\][^"]*ring-\[var\(--radio-border\)\]/,
  );
});
