import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { GA4_MEASUREMENT_ID } from '../utils/ga4-config.mjs';

/**
 * Verify the actual prerendered HTML, not just the Nuxt source code.
 * The tag is in <head> before hydration, and the client-side hostname guard
 * is required because a production build may be mirrored to a preview URL.
 */
export async function assertGa4Output(root, target) {
  assert.ok(['production', 'staging'].includes(target), 'Expected production or staging');
  const pages = ['index.html', 'asia/viet-nam/vov-gt-hcm/index.html'];
  for (const page of pages) {
    const html = await readFile(join(root, page), 'utf8');
    const head = html.split('</head>')[0] || '';
    const inlineScripts = [...head.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)]
      .map((match) => match[1]);
    const gaBootstraps = inlineScripts.filter((code) =>
      code.includes('www.googletagmanager.com/gtag/js?id='));
    const externalGaTags = [...html.matchAll(/<script\b[^>]*src=["']https:\/\/www\.googletagmanager\.com\/gtag\/js[^"']*["'][^>]*>/gi)];

    assert.equal(externalGaTags.length, 0,
      page + ': no second unconditional Google tag script may be injected');

    if (target === 'production') {
      assert.equal(gaBootstraps.length, 1, page + ': missing or duplicate Google tag bootstrap');
      const code = gaBootstraps[0];
      assert.ok(code.includes("window.location.hostname !== 'radio.eplus.dev'"),
        page + ': preview-host protection missing');
      assert.ok(code.includes("window.gtag('config', '" + GA4_MEASUREMENT_ID + "')"),
        page + ': GA4 measurement ID mismatch or initial page_view disabled');
      assert.ok(code.includes('window.dataLayer = window.dataLayer || []'),
        page + ': gtag queue not initialized');
      assert.ok(code.includes('document.head.appendChild(tag)'),
        page + ': gtag.js script never loaded');
    } else {
      assert.equal(gaBootstraps.length, 0, page + ': staging must not embed Google tag');
      assert.ok(!head.includes('googletagmanager.com/gtag/js'),
        page + ': staging must not load Google tag');
    }
  }
  console.log('PASS: ' + target + ' prerendered pages have the correct single GA4 tag policy.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  assertGa4Output(process.argv[2] || '.output/public', process.argv[3])
    .catch((error) => { console.error(error); process.exitCode = 1; });
}
