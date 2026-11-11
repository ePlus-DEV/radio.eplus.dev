import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
const readJson = async path => JSON.parse(await read(path));

const LOCALES = ['en-US', 'vi-VN', 'ja-JP', 'zh-CN', 'zh-TW', 'fr-FR', 'ru-RU'];

test('footer renders only social links with a configured href', async () => {
  const footer = await read('components/AppFooter.vue');
  const block = footer.split('const socialLinks = computed(')[1]?.split('const handleScroll')[0];
  assert.ok(block, 'socialLinks computed exists');
  assert.match(block, /href: config\.public\.facebook/);
  assert.match(block, /href: config\.public\.x/);
  assert.match(block, /\.filter\(/);
  assert.match(block, /typeof link\.href === "string" && link\.href\.trim\(\)\.length > 0/,
    'empty/unset social hrefs are filtered out instead of rendering a dead anchor');
});

test('client catalog fetches fail fast with an 8s timeout', async () => {
  const countryPage = await read('pages/[area]/[country]/index.vue');
  assert.match(countryPage, /\$fetch<Record<string, Channel>>\(catalogUrl\.value, \{\s*timeout: 8000,?\s*\}\)/,
    'country catalog $fetch carries timeout: 8000');
  // The server-side fs read path must stay untouched.
  assert.match(countryPage, /readFile\(file, "utf8"\)/);

  const stationPage = await read('pages/[area]/[country]/[station].vue');
  assert.match(stationPage, /\$fetch<Record<string, StationCatalogEntry>>\(\s*stationCatalogUrl\.value,\s*\{ timeout: 8000 \},?\s*\)/,
    'station catalog $fetch carries timeout: 8000');
  assert.match(stationPage, /readFile\(file, "utf8"\)/);
});

test('PanelRadio country eyebrow renders only above the first area section', async () => {
  const radio = await read('components/panel/Radio.vue');
  assert.match(radio, /const firstAreaKey = computed\(\(\) => Object\.keys\(world\.value\)\[0\]\)/);
  assert.match(radio, /<p v-if="continentIndex === firstAreaKey"[^>]*>\s*\{\{ \$t\("panel\.country"\) \}\}/,
    'the Quốc gia eyebrow is gated to the first area section');
  assert.equal(radio.split('$t("panel.country")').length - 1, 1,
    'panel.country is rendered from exactly one place');
});

test('vi-VN world country names are Vietnamese, not English copies', async () => {
  const vi = await readJson('lang/vi-VN.json');
  const en = await readJson('lang/en-US.json');
  const expected = {
    africa: { algeria: 'An-giê-ri' },
    europe: { ireland: 'Ai-len' },
    south_america: { brazil: 'Bra-xin' },
    oceania: { new_zealand: 'Niu Di-lân' },
  };
  for (const [area, countries] of Object.entries(expected)) {
    for (const [key, name] of Object.entries(countries)) {
      assert.equal(vi.world[area][key], name, `vi-VN world.${area}.${key}`);
      assert.notEqual(vi.world[area][key], en.world[area][key],
        `vi-VN world.${area}.${key} must differ from en-US`);
    }
  }
});

test('global_radio.external_note uses conditional in-app wording in all locales', async () => {
  for (const locale of LOCALES) {
    const data = await readJson(`lang/${locale}.json`);
    const note = data.global_radio.external_note;
    assert.equal(typeof note, 'string', `${locale} external_note exists`);
    assert.ok(note.includes('Apple Music'), `${locale} external_note mentions Apple Music`);
    assert.ok(!note.includes('does not play through'), `${locale} dropped the old absolute en claim`);
    assert.ok(!note.includes('không phát trong'), `${locale} dropped the old absolute vi claim`);
  }
  const en = await readJson('lang/en-US.json');
  assert.match(en.global_radio.external_note, /play right in ePlus OnAir when an authorized source is available/);
  assert.match(en.global_radio.external_note, /opens on Apple Music or TuneIn instead/);
  const vi = await readJson('lang/vi-VN.json');
  assert.match(vi.global_radio.external_note, /phát ngay trong ePlus OnAir khi có nguồn được cấp phép/);
  assert.match(vi.global_radio.external_note, /mở trên Apple Music hoặc TuneIn/);
});

test('station/country artwork gets more of the card area', async () => {
  const css = await read('assets/css/main.css');
  const stationImg = css.split('.radio-card-compact-station-img')[1]?.split('}')[0];
  assert.ok(stationImg, 'station img rule exists');
  assert.match(stationImg, /max-h-\[88%\]/);
  assert.match(stationImg, /max-w-\[88%\]/);
  const countryImg = css.split('.radio-card-compact-country-img')[1]?.split('}')[0];
  assert.ok(countryImg, 'country img rule exists');
  assert.match(countryImg, /max-h-\[86%\]/);
  assert.match(countryImg, /max-w-\[90%\]/);

  const featured = await read('components/panel/FeaturedStations.vue');
  assert.match(featured, /max-h-\[88%\] max-w-\[92%\]/, 'featured artwork uses the larger bounds');
  assert.ok(!featured.includes('max-h-[75%]'), 'old featured artwork bound is gone');
});
