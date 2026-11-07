import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRetryableHlsLoader } from '../utils/retryable-hls-loader.mjs';

const Hls = class Hls {
  static isSupported() { return true; }
};

test('concurrent HLS requests share one import, and successful imports are cached', async () => {
  let imports = 0;
  let finish;
  const load = createRetryableHlsLoader(() => {
    imports += 1;
    return new Promise(resolve => { finish = resolve; });
  });

  const first = load();
  const second = load();
  await Promise.resolve();
  assert.equal(imports, 1);
  finish({ default: Hls });
  assert.equal(await first, Hls);
  assert.equal(await second, Hls);
  assert.equal(await load(), Hls);
  assert.equal(imports, 1, 'successful HLS module must not be imported repeatedly');
});

test('transient rejected HLS import can retry without exceeding Player retry policy', async () => {
  let imports = 0;
  const load = createRetryableHlsLoader(async () => {
    imports += 1;
    if (imports === 1) throw new Error('chunk load failed');
    return { default: Hls };
  });

  const first = load();
  const sameAttempt = load();
  await assert.rejects(first, /chunk load failed/);
  await assert.rejects(sameAttempt, /chunk load failed/);
  assert.equal(imports, 1, 'a failed concurrent import must only count as one request');
  assert.equal(await load(), Hls);
  assert.equal(imports, 2, 'next recovery attempt must be allowed to fetch again');
});

test('invalid module shape is rejected rather than permanently cached', async () => {
  let imports = 0;
  const load = createRetryableHlsLoader(async () => {
    imports += 1;
    return imports === 1 ? { default: {} } : { default: Hls };
  });

  await assert.rejects(load(), /Invalid hls\.js module/);
  assert.equal(await load(), Hls);
  assert.equal(imports, 2);
  assert.throws(() => createRetryableHlsLoader(null), /loader must be a function/);
});

test('Player uses the retryable lazy module loader, preserving existing bounded fallback', async () => {
  const player = await readFile(new URL('../components/player/Player.vue', import.meta.url), 'utf8');
  assert.match(player, /createRetryableHlsLoader\(\(\) => import\(["']hls\.js["']\)\)/);
  assert.match(player, /const Hls = await ensureHls\(\)/);
  assert.match(player, /if \(version !== sourceVersion \|\| !mediaElement\.value\) return;/);
  assert.match(player, /catch \(error\) \{[\s\S]*?scheduleReconnect\(\);/);
  assert.doesNotMatch(player, /^import .* from ["']hls\.js["']/m, 'HLS bundle must stay lazy');
});
