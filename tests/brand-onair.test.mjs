import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const locales = ['en-US','vi-VN','ja-JP','zh-CN','zh-TW','fr-FR','ru-RU'];
const read = p => readFile(p,'utf8');

test('all seven locales use ePlus OnAir and the exact official slogan', async () => {
  for (const locale of locales) {
    const raw = await read('lang/' + locale + '.json');
    const data = JSON.parse(raw);
    assert.equal(data.brand.slogan, 'Listen Beyond Borders.');
    assert.ok(data.brand.slogan_localized?.trim(), locale + ' missing localized slogan');
    assert.equal(data.footer.tagline, 'Listen Beyond Borders.');
    assert.doesNotMatch(raw, /Radio ePlus|Радио ePlus/i, locale + ' still shows old brand');
    assert.match(data.site_pages.about.title, /ePlus OnAir/);
    assert.match(data.site_pages.cookie.sections.analytics.body, /Google Analytics 4/);
    // Preserve all interpolation variables and player semantics.
    assert.match(data.seo.country_description, /\{count\}/);
    assert.match(data.seo.station_description, /\{station\}/);
    assert.match(data.player.source_number, /\{number\}/);
  }
});

test('header, footer, hero and policy pages show the new identity', async () => {
  const [header, footer, home, about, contact, config] = await Promise.all([
    read('components/AppHeader.vue'),
    read('components/AppFooter.vue'),
    read('pages/index.vue'),
    read('pages/about.vue'),
    read('pages/contact.vue'),
    read('nuxt.config.ts'),
  ]);
  assert.match(header, /ePlus <span class="text-rose-500">OnAir<\/span>/);
  assert.match(header, /brand\.slogan/);
  assert.match(header, /onair-mark\.svg/);
  assert.match(footer, /ePlus OnAir/);
  assert.match(footer, /onair-mark\.svg/);
  assert.match(home, /ePlus OnAir ·/);
  assert.match(about, /ePlus OnAir/);
  assert.match(contact, /ePlus%20OnAir%20support/);
  assert.match(config, /SITE_NAME \|\| "ePlus OnAir"/);
  assert.match(config, /Listen Beyond Borders/);
  for(const [file,text] of [['header',header],['footer',footer],['about',about]]) {
    assert.doesNotMatch(text,/Radio ePlus/i,file);
  }
});

test('canonical domains and existing service identifiers are preserved', async () => {
  const [config, seo, ga4, app] = await Promise.all([
    read('nuxt.config.ts'), read('utils/seo-deployment.mjs'),
    read('utils/ga4-config.mjs'), read('app.vue'),
  ]);
  assert.match(config, /https:\/\/radio\.eplus\.dev/);
  assert.match(config, /algoliaIndexStation: "radio\.eplus\.dev"/);
  assert.match(ga4, /radio\.eplus\.dev/);
  assert.match(seo, /radio-new\.eplus\.dev/);
  assert.match(app, /onair-share\.png/);
  assert.match(app, /ogSiteName: siteName\.value/);
});

test('new vector artwork is the source for consistent PNG social and app icons', async () => {
  const [mark, image, generator, manifest, pkg, pinned] = await Promise.all([
    read('public/brand/onair-mark.svg'),
    read('public/brand/onair-share.svg'),
    read('scripts/generate-brand-assets.mjs'),
    read('public/brand/site.webmanifest'),
    read('package.json'),
    read('public/brand/safari-pinned-tab.svg'),
  ]);
  assert.match(mark, /<svg/);
  assert.match(image, /Listen Beyond Borders/);
  assert.match(image, /ePlus/);
  assert.match(generator, /onair-share\.png/);
  assert.match(generator, /logo-share\.png/);
  assert.match(generator, /favicon\.ico/);
  assert.match(generator, /apple-touch-icon/);
  assert.match(generator, /sharp/);
  assert.match(pinned, /<svg/);
  const m=JSON.parse(manifest),p=JSON.parse(pkg);
  assert.equal(m.short_name,'ePlus OnAir');
  assert.ok(m.icons.some(i=>i.src==='./onair-mark.svg'));
  assert.equal(p.name,'eplus-onair');
  for(const task of ['predev','prebuild','pregenerate']){
    assert.match(p.scripts[task], /generate-brand-assets\.mjs/);
  }
});
