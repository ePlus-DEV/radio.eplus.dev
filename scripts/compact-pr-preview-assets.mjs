import { readFile, readdir, rm } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';

// PR previews intentionally prerender only representative routes. Retaining
// every worldwide station PNG creates thousands of files per open PR and can
// stall GitHub Pages while it is "syncing_files". Do not apply to staging/main.
const normalized = value => String(value || '').replaceAll('\\', '/').replace(/^\/+/, '');

async function listFiles(directory) {
  const files = [];
  async function visit(dir) {
    for (const item of await readdir(dir, { withFileTypes: true })) {
      const pathname = join(dir, item.name);
      if (item.isSymbolicLink()) throw new Error('Symlinks are not allowed in PR preview artifacts');
      if (item.isDirectory()) await visit(pathname);
      else if (item.isFile()) files.push(pathname);
    }
  }
  await visit(directory);
  return files;
}

export async function compactPrPreviewAssets(output = '.output/public') {
  const root = resolve(output);
  const imagesRoot = join(root, 'img');
  let images;
  try {
    images = await listFiles(imagesRoot);
  } catch (error) {
    if (error?.code === 'ENOENT') return { before: 0, after: 0, removed: 0 };
    throw error;
  }

  const keep = new Set();
  const add = value => {
    if (typeof value !== 'string') return;
    let asset = value.trim().split(/[?#]/)[0];
    // Nuxt prerenders absolute URLs with the per-PR base path.
    asset = asset.replace(/^\/pr-preview\/pr-[1-9][0-9]*\//, '/');
    if (!/^\/img\/[a-z0-9/_\-.]+$/i.test(asset)) return;
    if (asset.includes('..')) return;
    keep.add(normalized(asset));
  };

  // Honor every statically referenced image in the representative HTML.
  const outputFiles = await listFiles(root);
  for (const pathname of outputFiles.filter(file => file.endsWith('.html'))) {
    const html = await readFile(pathname, 'utf8');
    for (const match of html.matchAll(/\/(?:pr-preview\/pr-[1-9][0-9]*\/)?img\/[a-z0-9/_\-.]+/gi)) {
      add(match[0]);
    }
  }

  // The search index stays complete (the user should still be able to search
  // every station), but its preview only needs a compact set of cover art.
  try {
    const index = JSON.parse(await readFile(join(root, 'search/stations.json'), 'utf8'));
    if (Array.isArray(index)) {
      for (const item of index) {
        const title = String(item?.station_name || '');
        if (item?.featured || (Number(item?.featured_rank) > 0 && Number(item.featured_rank) <= 30)
          || /^(heart (?:uk|80s|70s|90s|dance)|apple music|vov)/i.test(title)) {
          add(item?.station_image);
        }
      }
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  let removed = 0;
  for (const pathname of images) {
    const rel = normalized(relative(root, pathname));
    const parts = rel.split('/');
    const keepArea = rel.startsWith('img/global-radio/')
      || rel.startsWith('img/asia/viet-nam/')
      || parts[2] === 'flags';
    if (keepArea || keep.has(rel)) continue;
    await rm(pathname);
    removed++;
  }
  const result = { before: images.length, after: images.length - removed, removed };
  console.log('PR Preview image compaction: ' + result.before + ' -> ' + result.after +
    ' files (' + result.removed + ' unnecessary station images removed)');
  return result;
}
