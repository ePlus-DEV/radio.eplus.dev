#!/usr/bin/env node
// Explicit, opt-in measurement of the actual generated Pages output.
// Never produce fabricated CPU/INP claims from static source inspections.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const origin = process.env.PERF_BASE_URL || 'http://127.0.0.1:3000';
const idleMs = Number(process.env.PERF_IDLE_MS ?? 300_000);
if (!Number.isInteger(idleMs) || idleMs < 0 || idleMs > 600_000) {
  throw Error('PERF_IDLE_MS must be 0..600000 milliseconds');
}
const routes = ['/', '/library#stats', '/asia/viet-nam', '/europe/belgium/studio-brussel'];
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const results = [];

try {
  for (const route of routes) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    let indexRequests = 0, networkRequests = 0;
    const errors = [];
    page.on('request', request => {
      networkRequests += 1;
      if (new URL(request.url()).pathname.endsWith('/search/stations.json')) indexRequests += 1;
    });
    page.on('pageerror', error => errors.push(String(error.message).slice(0, 200)));

    await page.addInitScript(() => {
      const data = { lcpMs: null, cls: 0, longTaskCount: 0, longTaskMs: 0, events: 0 };
      Object.defineProperty(window, '__radioPerfMetrics', { value: data, configurable: false });
      for (const [kind, observe] of [
        ['largest-contentful-paint', entry => { data.lcpMs = entry.startTime; }],
        ['layout-shift', entry => { if (!entry.hadRecentInput) data.cls += entry.value; }],
        ['longtask', entry => { data.longTaskCount++; data.longTaskMs += entry.duration; }],
        ['event', () => { data.events++; }],
      ]) {
        try {
          const po = new PerformanceObserver(list => {
            for (const entry of list.getEntries()) observe(entry);
          });
          po.observe({ type: kind, buffered: true });
        } catch { /* Unsupported metric is null, never zero by invention. */ }
      }
    });

    const started = Date.now();
    const response = await page.goto(new URL(route, origin).href, { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await page.waitForTimeout(1_500);
    // Only the home route gets the expensive five-minute idle measurement.
    // It must stay silent: no station Play button is activated by this script.
    if (route === '/' && idleMs) await page.waitForTimeout(idleMs);
    const raw = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      const nav = performance.getEntriesByType('navigation')[0];
      return {
        metrics: { ...window.__radioPerfMetrics },
        domContentLoadedMs: nav?.domContentLoadedEventEnd ?? null,
        resourceTransferBytes: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        resourceDecodedBytes: resources.reduce((sum, r) => sum + (r.decodedBodySize || 0), 0),
        loadedResources: resources.length,
        visibility: document.visibilityState,
      };
    });
    results.push({
      route, status: response?.status() ?? null,
      observedWallMs: Date.now() - started,
      idlePeriodMs: route === '/' ? idleMs : 0,
      searchIndexRequestsWithoutSearchIntent: indexRequests,
      requestsObserved: networkRequests,
      pageErrors: errors, ...raw,
    });
    await page.close();
  }
} finally {
  await browser.close();
}

const output = {
  generatedAt: new Date().toISOString(),
  browser: 'Chromium / Playwright',
  origin,
  viewport: { width: 390, height: 844 },
  measurement: 'Observed browser timings only; not a Lighthouse score or an INP/real battery benchmark',
  notes: [
    'Transfer sizes omit resource bytes not exposed by PerformanceResourceTiming.',
    'The event counter is not INP; no interaction-dependent INP estimate is claimed.',
    'Idle long-task duration is not a CPU utilization or battery-consumption measurement.',
    'Repeat with cold/warm cache, real devices, and production-equivalent network before #328 closure.',
  ],
  pages: results,
};
const path = resolve('reports/client-performance-observed.json');
await mkdir(resolve('reports'), { recursive: true });
await writeFile(path, JSON.stringify(output, null, 2) + '\n');
console.log('Saved observed browser metrics to', path);
console.table(results.map(x => ({
  route: x.route, status: x.status, lcpMs: x.metrics.lcpMs,
  cls: +x.metrics.cls.toFixed(4), longTasks: x.metrics.longTaskCount,
  searchIndexRequests: x.searchIndexRequestsWithoutSearchIntent,
  pageErrors: x.pageErrors.length,
})));
