import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const locales = ['en-US', 'vi-VN', 'ja-JP', 'zh-CN', 'zh-TW', 'fr-FR', 'ru-RU'];
const read = async locale => JSON.parse(await readFile(`lang/${locale}.json`, 'utf8'));
const get = (object, key) => key.split('.').reduce((value, part) => value?.[part], object);

const userFacingKeys = [
  'panel.updating', 'player.source', 'player.primary_source',
  'player.alternative_source', 'player.source_number', 'player.stream_format',
  'player.proxy', 'player.direct',
  'site_pages.about.description', 'site_pages.about.sections.playback.body',
  'site_pages.about.sections.availability.title', 'site_pages.about.sections.availability.body',
  'site_pages.about.service.title', 'site_pages.about.service.body',
  'site_pages.privacy.description', 'site_pages.privacy.sections.preferences.title',
  'site_pages.privacy.sections.preferences.body', 'site_pages.privacy.sections.search.body',
  'site_pages.privacy.sections.streams.title', 'site_pages.privacy.sections.streams.body',
  'site_pages.privacy.sections.logs.title', 'site_pages.privacy.sections.logs.body',
  'site_pages.privacy.sections.sharing.body',
  'site_pages.terms.sections.third_party.title', 'site_pages.terms.sections.third_party.body',
  'site_pages.terms.sections.acceptable_use.title', 'site_pages.terms.sections.acceptable_use.body',
  'site_pages.terms.sections.availability.title', 'site_pages.terms.sections.availability.body',
  'site_pages.terms.sections.copyright.body',
  'site_pages.contact.description', 'site_pages.contact.sections.bug.title',
  'site_pages.contact.sections.bug.body', 'site_pages.contact.sections.station.body',
  'site_pages.contact.sections.copyright.body', 'site_pages.contact.support.title',
  'site_pages.contact.support.body', 'site_pages.statistics.eyebrow',
  'site_pages.statistics.description', 'site_pages.statistics.coverage_description',
  'site_pages.statistics.method_title', 'site_pages.statistics.method_body',
  'site_pages.cookie.description', 'site_pages.cookie.sections.essential.body',
  'site_pages.cookie.sections.analytics.title', 'site_pages.cookie.sections.analytics.body',
  'site_pages.cookie.sections.third_party.body', 'site_pages.cookie.sections.choices.body',
  'site_pages.cookie.sections.changes.body',
  'cookie_consent.body', 'cookie_consent.analytics_body',
  'alert.stream_error', 'text.offline',
];

test('listener-facing copy exists and is translated in all seven languages', async () => {
  const english = await read('en-US');
  assert.equal(userFacingKeys.length, 53);
  for (const locale of locales) {
    const content = await read(locale);
    for (const key of userFacingKeys) {
      const value = get(content, key);
      assert.ok(typeof value === 'string' && value.trim(), `${locale} missing ${key}`);
      if (locale !== 'en-US' && key !== 'player.source_number') {
        assert.notEqual(value, get(english, key), `${locale} left ${key} in English`);
      }
    }
  }
});

test('public copy explains actions without displaying internal implementation jargon', async () => {
  const keyPaths = [
    'site_pages.about.sections.playback.body',
    'site_pages.statistics.description',
    'site_pages.statistics.method_body',
    'site_pages.contact.sections.bug.body',
    'site_pages.privacy.sections.logs.body',
    'site_pages.terms.sections.availability.body',
  ];
  for (const locale of locales) {
    const translation = await read(locale);
    for (const key of keyPaths) {
      assert.doesNotMatch(get(translation, key), /\bHLS\b|\bfallback\b|\bcatalog\b|\bmetadata\b|\bCDN\b|\bConsole\b|\bNetwork\b|\bbuild.time\b|\bAPI\b/i,
        `${locale}: technical language in ${key}`);
    }
    const radioOption = get(translation, 'player.source_number');
    assert.match(radioOption, /\{number\}/, `${locale}: player source interpolation lost`);
  }
});

test('cookie notice stays factual about automatic GA4 instead of promising opt-in', async () => {
  for (const locale of locales) {
    const content = await read(locale);
    assert.match(get(content, 'cookie_consent.analytics_body'), /Google Analytics 4/);
    assert.match(get(content, 'site_pages.cookie.sections.analytics.body'), /Google Analytics 4/);
    assert.equal(typeof get(content, 'cookie_consent.accept'), 'string');
    assert.equal(get(content, 'cookie_consent.allow_analytics'), undefined);
  }
});
