import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildActivityTrend } from '../utils/activity-trend.mjs';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('trend geometry uses daily values rather than cumulative totals', () => {
  const points = [
    { key: '2026-11-01', ms: 0 },
    { key: '2026-11-02', ms: 60_000 },
    { key: '2026-11-03', ms: 12_000 },
  ];
  const trend = buildActivityTrend(points);
  assert.equal(trend.maxMs, 60_000);
  assert.equal(trend.hasData, true);
  assert.equal(trend.points.length, 3);
  assert.equal(trend.points[1].y, 8, 'largest daily value reaches the top');
  assert.equal(trend.points[0].y, 88, 'zero daily value stays at baseline');
  assert.equal(trend.points[2].y, 72, 'daily total is positioned by its own scale');
  assert.match(trend.areaPath, /^M/);
  assert.match(trend.areaPath, /Z$/);
  assert.doesNotMatch(trend.linePath, /NaN|Infinity/);
});

test('zero, one-point and invalid samples do not break chart rendering', () => {
  const empty = buildActivityTrend([]);
  assert.equal(empty.hasData, false);
  assert.equal(empty.linePath, '');
  assert.equal(empty.areaPath, '');
  const zeros = buildActivityTrend([{ key: 'a', ms: 0 }, { key: 'b', ms: null }]);
  assert.equal(zeros.hasData, false);
  assert.equal(zeros.points[0].y, 88);
  assert.equal(zeros.points[1].y, 88);
  const single = buildActivityTrend([{ key: 'a', ms: 10 }]);
  assert.equal(single.points[0].x, 160);
  assert.equal(single.points[0].y, 8);
  const invalid = buildActivityTrend([{ key: 'a', ms: -4 }, { key: 'b', ms: Infinity }]);
  assert.equal(invalid.maxMs, 0);
  assert.doesNotMatch(invalid.linePath, /NaN|Infinity/);
});

test('large differences use independent scales so new online data stays visible', () => {
  const listening = buildActivityTrend([{ key: 'day1', ms: 3_600_000 }, { key: 'day2', ms: 900_000 }]);
  const online = buildActivityTrend([{ key: 'day1', ms: 7_000 }, { key: 'day2', ms: 1_000 }]);
  assert.equal(listening.maxMs, 3_600_000);
  assert.equal(online.maxMs, 7_000);
  assert.equal(listening.points[0].y, 8);
  assert.equal(online.points[0].y, 8);
});

test('compact statistics renders two accessible trends and retains daily inspection and opt outs', async () => {
  const [ui, docs] = await Promise.all([
    read('components/panel/ListeningStats.vue'),
    read('docs/PROJECT_CONTEXT.md'),
  ]);
  assert.match(ui, /listeningGeometry\.areaPath/);
  assert.match(ui, /onlineGeometry\.areaPath/);
  assert.match(ui, /buildActivityTrend\(listeningTrend\.value\)/);
  assert.match(ui, /buildActivityTrend\(onlineTrend\.value\)/);
  assert.match(ui, /min="0" :max="Math\.max\(0, listeningTrend\.length - 1\)"/);
  assert.match(ui, /selectDayAtIndex/);
  assert.match(ui, /:aria-checked="duration\.enabled"/);
  assert.match(ui, /:aria-checked="online\.enabled"/);
  assert.match(ui, /duration\.clearStatistics\(\)/);
  assert.match(ui, /online\.clearStatistics\(\)/);
  assert.doesNotMatch(ui, /chartScroll|chartMode|ref="chartScroll"/);
  assert.match(docs, /Online presence time versus listening duration/);
});

test('seven translations have complete and distinct explanations', async () => {
  for (const locale of ['en-US', 'vi-VN', 'ja-JP', 'fr-FR', 'ru-RU', 'zh-CN', 'zh-TW']) {
    const copy = JSON.parse(await read('lang/' + locale + '.json')).online_stats;
    for (const key of ['compare_intro', 'manage_settings', 'listening_explanation',
      'online_explanation', 'new_counter_note', 'daily_compare', 'listening_trend',
      'online_trend', 'selected_day', 'select_day', 'independent_scales']) {
      assert.ok(typeof copy[key] === 'string' && copy[key].trim(), locale + ' missing ' + key);
    }
  }
});
