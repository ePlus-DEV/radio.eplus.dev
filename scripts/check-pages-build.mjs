import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const MAX_PAGES_BYTES = 1_000_000_000;

export async function checkPagesBuild(root, target) {
  assert.ok(['production', 'staging'].includes(target), 'Expected production or staging');
  const home = await readFile(join(root, 'index.html'), 'utf8');
  const robots = await readFile(join(root, 'robots.txt'), 'utf8');
  const hasNoindex = /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*noindex)[^>]*>/i.test(home);
  assert.equal(hasNoindex, target === 'staging', 'Generated robots metadata does not match target');
  assert.equal(/Sitemap:/i.test(robots), target === 'production', 'Generated robots.txt has wrong sitemap setting');

  let bytes = 0;
  let count = 0;
  async function scan(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error('Symlinks must not be published: ' + relative(root, full));
      if (entry.isDirectory()) {
        assert.ok(!['.git', '.github', 'node_modules'].includes(entry.name), 'Unexpected private directory: ' + full);
        await scan(full);
      } else if (entry.isFile()) {
        assert.ok(!['.env', '.env.local', '.npmrc'].includes(entry.name), 'Private configuration in output: ' + full);
        assert.ok(!entry.name.endsWith('.map'), 'Do not publish production source maps: ' + full);
        const info = await stat(full);
        bytes += info.size;
        count += 1;
      }
    }
  }

  await scan(root);
  assert.ok(bytes < MAX_PAGES_BYTES, 'GitHub Pages generated site exceeds 1 GB: ' + bytes);
  assert.ok(count > 0, 'No static assets produced');
  console.log('PASS: ' + target + ' Pages output: ' + count + ' files, ' + (bytes / 1024 / 1024).toFixed(1) + ' MiB');
  return { bytes, count };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await checkPagesBuild(process.argv[2] || '.output/public', process.argv[3]);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
