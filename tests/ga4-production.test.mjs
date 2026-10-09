import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  GA4_MEASUREMENT_ID,
  ANALYTICS_CONSENT_KEY,
  isGa4ProductionBuild,
  canStartGa4,
  isAnalyticsDecision,
} from '../utils/ga4-config.mjs';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('GA4 is enabled only on the canonical production site', () => {
  assert.equal(GA4_MEASUREMENT_ID, 'G-ETDY41KBBJ');
  const production = { nodeEnv: 'production', siteUrl: 'https://radio.eplus.dev', noIndex: false };
  assert.equal(isGa4ProductionBuild(production), true);
  for (const context of [
    { ...production, nodeEnv: 'development' },
    { ...production, nodeEnv: 'test' },
    { ...production, noIndex: true },
    { ...production, siteUrl: 'http://localhost:3000' },
    { ...production, siteUrl: 'https://radio-new.eplus.dev' },
    { ...production, siteUrl: 'https://arcade.eplus.dev' },
    { ...production, siteUrl: 'http://radio.eplus.dev' },
    { ...production, siteUrl: 'not-a-url' },
  ]) {
    assert.equal(isGa4ProductionBuild(context), false, JSON.stringify(context));
  }
});

test('GA4 tracking never starts before explicit analytics consent', () => {
  assert.equal(ANALYTICS_CONSENT_KEY, 'radio:analytics-consent');
  assert.equal(canStartGa4({ enabled: true, hostname: 'radio.eplus.dev', consent: 'granted' }), true);
  for (const params of [
    { enabled: false, hostname: 'radio.eplus.dev', consent: 'granted' },
    { enabled: true, hostname: 'localhost', consent: 'granted' },
    { enabled: true, hostname: 'radio-new.eplus.dev', consent: 'granted' },
    { enabled: true, hostname: 'radio.eplus.dev', consent: 'accepted' },
    { enabled: true, hostname: 'radio.eplus.dev', consent: 'denied' },
    { enabled: true, hostname: 'radio.eplus.dev', consent: '' },
  ]) assert.equal(canStartGa4(params), false, JSON.stringify(params));
  assert.equal(isAnalyticsDecision('granted'), true);
  assert.equal(isAnalyticsDecision('denied'), true);
  assert.equal(isAnalyticsDecision('accepted'), false);
});

test('Nuxt exposes GA4 only in production and initializes after consent', async () => {
  const [config, plugin, consent, preferences, cookiePage] = await Promise.all([
    read('nuxt.config.ts'),
    read('plugins/ga4.client.ts'),
    read('components/CookieConsent.vue'),
    read('components/AnalyticsPreferences.vue'),
    read('pages/cookie-policy.vue'),
  ]);
  assert.match(config, /ga4Enabled = isGa4ProductionBuild\(/);
  assert.match(config, /ga4MeasurementId: ga4Enabled \? GA4_MEASUREMENT_ID : ""/);
  assert.match(plugin, /config\.public\.ga4Enabled/);
  assert.match(plugin, /hostname !== 'radio\.eplus\.dev'/);
  assert.match(plugin, /consent: window\.localStorage\.getItem\(ANALYTICS_CONSENT_KEY\)/);
  assert.match(plugin, /if \(!permitted\(\)\)/);
  assert.match(plugin, /script\.src = `https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=/);
  assert.match(plugin, /send_page_view: false/);
  assert.match(plugin, /lastPagePath = path/);
  assert.match(plugin, /router\.afterEach\(/);
  assert.match(plugin, /nuxtApp\.hook\('page:finish', trackPageView\)/);
  assert.doesNotMatch(config, /googletagmanager\.com/); // Never inject tracking into server-rendered head.
  assert.match(consent, /radio:cookie-consent/);
  assert.match(consent, /analyticsAvailable \? "cookie_consent\.allow_analytics"/);
  assert.match(consent, /@click="denyAnalytics"/);
  assert.match(consent, /!isAnalyticsDecision/);
  assert.match(preferences, /@click="choose\(true\)"/);
  assert.match(preferences, /@click="choose\(false\)"/);
  assert.match(cookiePage, /<AnalyticsPreferences\s*\/>/);
});

test('all supported locales disclose analytics choices', async () => {
  for (const locale of ['en-US', 'vi-VN', 'ja-JP', 'zh-CN', 'zh-TW', 'fr-FR', 'ru-RU']) {
    const data = JSON.parse(await read(`lang/${locale}.json`));
    for (const key of ['analytics_body', 'allow_analytics', 'essential_only', 'analytics_preferences', 'analytics_on', 'analytics_off']) {
      assert.ok(data.cookie_consent[key], `${locale} missing ${key}`);
    }
    assert.match(data.site_pages.cookie.sections.analytics.body, /Google Analytics 4/);
  }
});
