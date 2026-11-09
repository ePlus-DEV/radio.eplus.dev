import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const read = async (name) => readFile(join(root, name), 'utf8');

test('remove unused direct dependencies and their orphaned lockfile packages', async () => {
  const pkg = JSON.parse(await read('package.json'));
  const lock = JSON.parse(await read('package-lock.json'));
  const unused = ['vue3-lottie', 'moment', '@fortawesome/free-regular-svg-icons'];
  const orphaned = ['lottie-web', 'fast-deep-equal'];

  assert.deepEqual(lock.packages[''].dependencies, pkg.dependencies,
    'lockfile root must match the production dependency manifest');
  for (const name of unused) {
    assert.equal(pkg.dependencies[name], undefined, name + ' must not be a direct dependency');
  }
  for (const name of [...unused, ...orphaned]) {
    assert.equal(lock.packages['node_modules/' + name], undefined,
      name + ' must not remain installed after pruning');
  }
  // Retain dependencies whose usage comes from Nuxt module configuration
  // or transitively through sitemap, Nuxt UI, the icon system, and build tooling.
  for (const name of ['@nuxtjs/sitemap', '@nuxt/ui', '@tailwindcss/vite', 'nuxt-site-config',
    '@fortawesome/free-solid-svg-icons', '@fortawesome/free-brands-svg-icons', 'sharp']) {
    assert.ok(pkg.dependencies[name], name + ' is still required');
  }
});

test('unused Vue3Lottie plugin is removed instead of shipping a dead registration', async () => {
  await assert.rejects(
    access(join(root, 'plugins/Vue3Lottie.client.ts')),
    { code: 'ENOENT' },
  );
});
