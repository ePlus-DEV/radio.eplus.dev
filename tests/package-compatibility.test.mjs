import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();

test("Nuxt devtools keeps a Simple Git version with the legacy default export", async () => {
  const [packageJsonSource, nuxtConfig] = await Promise.all([
    readFile(join(ROOT, "package.json"), "utf8"),
    readFile(join(ROOT, "nuxt.config.ts"), "utf8"),
  ]);
  const packageJson = JSON.parse(packageJsonSource);

  assert.equal(packageJson.overrides?.["simple-git"], "3.36.0");
  assert.match(
    nuxtConfig,
    /devtools:\s*\{\s*enabled:\s*true\s*\}/,
    "Nuxt DevTools relies on Simple Git 3.x compatibility",
  );
});
