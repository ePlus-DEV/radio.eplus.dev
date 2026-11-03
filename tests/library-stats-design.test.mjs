import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('approved dashboard contains two live hero cards, four compact summaries and one chart', async () => {
  const component = await read('components/panel/ListeningStats.vue');
  const page = await read('pages/library.vue');

  assert.match(page, /library-title-icon/);
  assert.match(page, /radio-library-tabs/);
  assert.match(component, /stats-hero-listening/);
  assert.match(component, /stats-hero-online/);
  assert.equal((component.match(/class="stats-mini /g) || []).length, 4);
  assert.match(component, /stats-sparkline-rose/);
  assert.match(component, /stats-sparkline-emerald/);
  assert.match(component, /listeningWeekDelta !== null/);
  assert.match(component, /onlineWeekDelta !== null/);
  assert.match(component, /previous > 0 \? Math\.round/);
  assert.match(component, /stations\.length/);
  assert.match(component, /stations\[0\]\.title/);
  assert.equal((component.match(/<svg /g) || []).length, 1, 'reuse one combined SVG chart');
});

test('chart retains filter, line fill, tooltip, touch and keyboard day selection', async () => {
  const component = await read('components/panel/ListeningStats.vue');
  assert.match(component, /v-for="option in chartFilters"/);
  assert.match(component, /v-for="days in \[7, 30, 90\]"/);
  assert.match(component, /listeningGeometry\.areaPath/);
  assert.match(component, /onlineGeometry\.areaPath/);
  assert.match(component, /listeningGeometry\.linePath/);
  assert.match(component, /onlineGeometry\.linePath/);
  assert.match(component, /role="tooltip"/);
  assert.match(component, /@pointermove="onChartPointerMove"/);
  assert.match(component, /@pointerdown="onChartPointerDown"/);
  assert.match(component, /@keydown\.left\.prevent/);
  assert.match(component, /@keydown\.right\.prevent/);
  assert.match(component, /:value="selectedDayIndex" @input="selectDayAtIndex"/);
  assert.match(component, /formatDuration\(inspectedListeningMs\)/);
  assert.match(component, /formatDuration\(inspectedOnlineMs\)/);
  assert.match(component, /independent_scales/);
});

test('station ranking uses real persisted listening data, meaningful percentages and artwork', async () => {
  const component = await read('components/panel/ListeningStats.vue');
  assert.match(component, /const stations = computed\(\(\) =>/);
  assert.match(component, /duration\.stats\.byStation/);
  assert.match(component, /const visibleStations = computed\(\(\) =>/);
  assert.match(component, /showAllStations = !showAllStations/);
  assert.match(component, /stationImage\(station\.url\)/);
  assert.match(component, /formatStationShare\(station\.ms\)/);
  assert.match(component, /percentOfMaxStation\(station\.ms\)/);
  assert.match(component, /listening\.library\.recent/);
  assert.match(component, /listening\.library\.favorites/);
  assert.match(component, /loading="lazy"/);
  assert.match(component, /confirmDeleteStatistics/);
  assert.match(component, /duration\.clearStatistics\(\)/);
  assert.match(component, /online\.clearStatistics\(\)/);
  assert.match(component, /:aria-checked="duration\.enabled"/);
  assert.match(component, /:aria-checked="online\.enabled"/);
});

test('design is route-scoped to dark library stats and has light/motion fallback', async () => {
  const [app, shell, stats, sidebar] = await Promise.all([
    read('app.vue'), read('assets/css/main.css'),
    read('components/panel/ListeningStats.vue'), read('components/AppSidebar.vue'),
  ]);
  assert.match(app, /'radio-stats-shell': clientReady && route\.path === '\/library' && route\.hash === '#stats'/);
  assert.match(shell, /html\.dark \.radio-shell\.radio-stats-shell/);
  assert.match(shell, /--radio-page-bg: #0e1228/);
  assert.match(stats, /:global\(html\.dark\) \.stats-hero-listening/);
  assert.match(stats, /:global\(html\.dark\) \.stats-hero-online/);
  assert.match(stats, /prefers-reduced-motion: reduce/);
  assert.match(sidebar, /redesign\.library/);
  assert.match(app, /<PlayerSession \/>/, 'persistent audio player must stay global');
});

test('every locale includes meaningful labels for the approved design', async () => {
  const locales = ['vi-VN', 'en-US', 'ja-JP', 'fr-FR', 'ru-RU', 'zh-CN', 'zh-TW'];
  for (const lang of locales) {
    const copy = JSON.parse(await read('lang/' + lang + '.json')).online_stats;
    for (const key of [
      'weekly_activity', 'vs_previous_week', 'stations_played',
      'most_listened_station', 'listening_peak', 'online_peak', 'show_all', 'show_less',
    ]) {
      assert.ok(typeof copy[key] === 'string' && copy[key].trim(), lang + ': missing ' + key);
    }
  }
});
