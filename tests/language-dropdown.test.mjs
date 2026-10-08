import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const file = join(process.cwd(), "components/lang/LangSwitcher.vue");

test("language dropdown uses controlled Vue state instead of DaisyUI focus state", async () => {
  const source = await readFile(file, "utf8");

  assert.match(source, /const open = ref\(false\)/);
  assert.match(source, /:aria-expanded="open"/);
  assert.match(source, /v-if="open"/);
  assert.match(source, /@click="toggleDropdown"/);
  assert.doesNotMatch(source, /class="dropdown dropdown-end"/);
  assert.doesNotMatch(source, /dropdown-content/);
  assert.doesNotMatch(source, /tabindex="0"/);
});

test("language dropdown closes on selection, outside click, escape and route change", async () => {
  const source = await readFile(file, "utf8");

  assert.match(source, /closeDropdown\(\);\s*await setLocale\(code\)/s);
  assert.match(source, /document\.addEventListener\("pointerdown", onDocumentPointerDown\)/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /route\.fullPath/);
  assert.match(source, /@keydown\.escape\.prevent\.stop="closeDropdown\(true\)"/);
});

test("language dropdown is anchored to the header trigger and keyboard accessible", async () => {
  const source = await readFile(file, "utf8");

  assert.match(source, /class="relative"/);
  assert.match(source, /absolute right-0 top-full/);
  assert.match(source, /aria-haspopup="menu"/);
  assert.match(source, /role="menu"/);
  assert.match(source, /role="menuitemradio"/);
  assert.match(source, /@keydown\.down\.prevent="openAndFocusFirst"/);
});
