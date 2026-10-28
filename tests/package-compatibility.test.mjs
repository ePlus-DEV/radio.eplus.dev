import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();

test("security patch does not re-enable incompatible legacy Nuxt DevTools", async () => {
  const [packageJsonSource, nuxtConfig, lockSource] = await Promise.all([
    readFile(join(ROOT, "package.json"), "utf8"),
    readFile(join(ROOT, "nuxt.config.ts"), "utf8"),
    readFile(join(ROOT, "package-lock.json"), "utf8"),
  ]);
  const pkg = JSON.parse(packageJsonSource);
  const lock = JSON.parse(lockSource);

  assert.equal(pkg.dependencies.nuxt, "4.6.3");
  assert.equal(pkg.overrides?.["simple-git"], "4.0.2");
  assert.equal(lock.packages["node_modules/nuxt"]?.version, "4.6.3");
  assert.equal(lock.packages["node_modules/simple-git"]?.version, "4.0.2");
  assert.match(
    nuxtConfig,
    /devtools:\s*\{\s*enabled:\s*false\s*\}/,
    "Nuxt DevTools 3 uses the old Simple Git default export and must stay off",
  );
});
