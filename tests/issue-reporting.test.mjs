import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stationReportUrl } from '../utils/station-sharing.mjs';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('issue forms are available for playback, website bugs, station updates and features', async () => {
  const templates = [
    '01-playback.yml',
    '02-website-bug.yml',
    '03-station-update.yml',
    '04-feature-request.yml',
  ];
  for (const template of templates) {
    const yaml = await read('.github/ISSUE_TEMPLATE/' + template);
    assert.match(yaml, /^name:\s*.+/m);
    assert.match(yaml, /^description:\s*.+/m);
    assert.match(yaml, /^body:\s*$/m);
    assert.match(yaml, /validations:\s*\n\s*required: true/);
  }
  const config = await read('.github/ISSUE_TEMPLATE/config.yml');
  assert.match(config, /^blank_issues_enabled:\s*false/m);
});

test('player prefill keys match the playback issue form input ids', async () => {
  const form = await read('.github/ISSUE_TEMPLATE/01-playback.yml');
  const ids = [...form.matchAll(/^\s+- type:\s*(input|textarea|dropdown|checkboxes)\s*\n\s+id:\s*([\w-]+)/gm)]
    .map((match) => match[2]);
  for (const id of ['station_url', 'observed_state', 'steps_to_reproduce', 'expected_behavior', 'device_browser', 'additional_context']) {
    assert.ok(ids.includes(id), `missing required report field: ${id}`);
  }
  assert.match(form, /id: safety_check/);
  const issueUrl = new URL(stationReportUrl('/asia/viet-nam/demo', 'Demo', 'exhausted'));
  assert.equal(issueUrl.searchParams.get('template'), '01-playback.yml');
  for (const key of issueUrl.searchParams.keys()) {
    if (key === 'template' || key === 'title') continue;
    assert.ok(ids.includes(key), `cannot prefill unknown GitHub form field ${key}`);
  }
  assert.equal(issueUrl.searchParams.get('station_url'), 'https://radio.eplus.dev/asia/viet-nam/demo');
});

test('contact page links to the correct forms without publishing visitor data', async () => {
  const page = await read('pages/contact.vue');
  assert.match(page, /section === 'bug' \|\| section === 'station'/);
  assert.match(page, /issues\/new\?template=02-website-bug\.yml/);
  assert.match(page, /issues\/new\?template=03-station-update\.yml/);
  assert.match(page, /rel="noopener noreferrer"/);
  assert.match(page, /mailto:support@eplus\.dev/);
  const recovery = await read('components/player/Recovery.vue');
  assert.match(recovery, /reportUrl && online && \(health === 'exhausted' \|\| health === 'unsupported'\)/);
  assert.doesNotMatch(recovery, /<form[^>]*action=/);
});

test('every supported language has report and contact CTA labels', async () => {
  for (const lang of ['en-US', 'vi-VN', 'ja-JP', 'zh-CN', 'zh-TW', 'fr-FR', 'ru-RU']) {
    const locale = JSON.parse(await read('lang/' + lang + '.json'));
    assert.ok(locale.recovery.report_hint);
    assert.ok(locale.site_pages.contact.sections.bug.action);
    assert.ok(locale.site_pages.contact.sections.station.action);
  }
});
