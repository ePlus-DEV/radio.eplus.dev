import test from 'node:test';
import assert from 'node:assert/strict';
import { createPrPreviewEnvironment } from '../utils/pr-preview-config.mjs';
import { isStagingDeployment } from '../utils/seo-deployment.mjs';
import { isGa4ProductionBuild } from '../utils/ga4-config.mjs';
import { stationOgDeployment } from '../utils/station-og-deployment.mjs';

test('Cloudflare PR previews override even production-like inherited environment', () => {
  const actual = createPrPreviewEnvironment({
    CF_PAGES: '1',
    CF_PAGES_URL: 'https://abc123.onair-pr-preview.pages.dev',
    NODE_ENV: 'production',
    NUXT_PUBLIC_SITE_URL: 'https://radio.eplus.dev',
    NUXT_PUBLIC_NO_INDEX: 'false',
    NUXT_APP_BASE_URL: '/legacy/',
    NUXT_PUBLIC_STATION_OG_BASE_URL: 'https://example.com/og',
    ONAIR_SKIP_STATION_OG: 'false',
  });
  assert.equal(actual.NUXT_PUBLIC_SITE_URL, 'https://abc123.onair-pr-preview.pages.dev');
  assert.equal(actual.NUXT_PUBLIC_NO_INDEX, 'true');
  assert.equal(actual.NUXT_APP_BASE_URL, '/');
  assert.equal(actual.ONAIR_SKIP_STATION_OG, 'true');
  assert.equal(actual.NUXT_PUBLIC_STATION_OG_BASE_URL, '');
  assert.equal(isStagingDeployment({
    siteUrl: actual.NUXT_PUBLIC_SITE_URL,
    noIndex: actual.NUXT_PUBLIC_NO_INDEX,
  }), true);
  assert.equal(isGa4ProductionBuild({
    nodeEnv: actual.NODE_ENV,
    siteUrl: actual.NUXT_PUBLIC_SITE_URL,
  }), false);
  assert.equal(stationOgDeployment({
    siteUrl: actual.NUXT_PUBLIC_SITE_URL,
    noIndex: actual.NUXT_PUBLIC_NO_INDEX,
    skip: actual.ONAIR_SKIP_STATION_OG,
    baseUrl: actual.NUXT_PUBLIC_STATION_OG_BASE_URL,
  }).mode, 'shared');
});

test('Cloudflare preview builds cannot run in a normal local/production environment', () => {
  assert.throws(() => createPrPreviewEnvironment({
    CF_PAGES_URL: 'https://branch.project.pages.dev',
  }), /CF_PAGES=1/);
});

test('Reject non-Cloudflare or ambiguous URL origins before building', () => {
  for (const invalid of [
    '', 'https://radio.eplus.dev', 'http://branch.project.pages.dev',
    'https://pages.dev', 'https://branch.project.pages.dev:8443',
    'https://branch.project.pages.dev/subpath',
    'https://branch.project.pages.dev/?foo=bar',
    'https://user:password@branch.project.pages.dev',
    'javascript:alert(1)',
  ]) {
    assert.throws(() => createPrPreviewEnvironment({
      CF_PAGES: '1', CF_PAGES_URL: invalid,
    }), /CF_PAGES_URL/, invalid);
  }
});
