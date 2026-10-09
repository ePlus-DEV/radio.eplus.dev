import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { GA4_MEASUREMENT_ID, isGa4ProductionBuild } from '../utils/ga4-config.mjs';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('GA4 can run only on the canonical production website', () => {
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
  ]) assert.equal(isGa4ProductionBuild(context), false, JSON.stringify(context));
});

test('Nuxt automatically loads production GA4 and tracks SPA page views once', async () => {
  const [config, plugin] = await Promise.all([
    read('nuxt.config.ts'),
    read('plugins/ga4.client.ts'),
  ]);
  assert.match(config, /ga4Enabled = isGa4ProductionBuild\(/);
  assert.match(config, /ga4MeasurementId: ga4Enabled \? GA4_MEASUREMENT_ID : ""/);
  assert.match(plugin, /config\.public\.ga4Enabled/);
  assert.match(plugin, /hostname !== 'radio\.eplus\.dev'/);
  assert.match(plugin, /script\.src = `https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=/);
  assert.match(plugin, /document\.head\.appendChild\(script\)/);
  assert.match(plugin, /send_page_view: false/);
  assert.match(plugin, /if \(path === lastPagePath\) return/);
  assert.match(plugin, /trackPageView\(\);/);
  assert.match(plugin, /router\.afterEach\(/);
  assert.match(plugin, /nuxtApp\.hook\('page:finish', trackPageView\)/);
  assert.doesNotMatch(plugin, /localStorage|ANALYTICS_CONSENT|applyConsent|permitted\(\)|ga-disable/);
  assert.doesNotMatch(config, /googletagmanager\.com/); // Don't insert GA4 via SSR on previews.
});

test('tracking notification is informational and cannot gate analytics', async () => {
  const [notice, policy] = await Promise.all([
    read('components/CookieConsent.vue'),
    read('pages/cookie-policy.vue'),
  ]);
  assert.match(notice, /radio:tracking-notice-v2/);
  assert.match(notice, /cookie_consent\.analytics_body/);
  assert.match(notice, /cookie_consent\.accept/);
  assert.match(notice, /localStorage\.setItem\(STORAGE_KEY, 'dismissed'\)/);
  assert.doesNotMatch(notice, /ANALYTICS_CONSENT|allow_analytics|denyAnalytics|essential_only|radio:analytics-consent/);
  assert.doesNotMatch(policy, /AnalyticsPreferences/);
});

test('all seven translations disclose GA4 and contain no opt-in/opt-out choices', async () => {
  for (const locale of ['en-US', 'vi-VN', 'ja-JP', 'zh-CN', 'zh-TW', 'fr-FR', 'ru-RU']) {
    const data = JSON.parse(await read(`lang/${locale}.json`));
    assert.ok(data.cookie_consent.analytics_body.includes('Google Analytics 4'), locale);
    assert.ok(data.site_pages.cookie.sections.analytics.body.includes('Google Analytics 4'), locale);
    for (const key of ['allow_analytics', 'essential_only', 'analytics_preferences', 'analytics_on', 'analytics_off']) {
      assert.equal(Object.hasOwn(data.cookie_consent, key), false, `${locale}: stale toggle ${key}`);
    }
  }
});
