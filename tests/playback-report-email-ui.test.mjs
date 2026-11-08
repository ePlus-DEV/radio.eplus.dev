import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stationReportEmailUrl } from '../utils/station-sharing.mjs';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('email reports open a draft and contain only a safe station page', () => {
  const link = stationReportEmailUrl('/asia/viet-nam/demo', 'Demo & radio', 'Report a problem', 'I cannot hear it.');
  assert.match(link, /^mailto:report@eplus\.dev\?/);
  const query = new URLSearchParams(link.split('?')[1]);
  assert.equal(query.get('subject'), 'Report a problem');
  assert.match(query.get('body'), /Demo & radio/);
  assert.match(query.get('body'), /https:\/\/radio\.eplus\.dev\/asia\/viet-nam\/demo/);
  for (const path of ['//evil.example/a', '/asia/viet-nam/a?stream=secret', '/a/b', 'https://evil.example/a/b/c']) {
    assert.equal(stationReportEmailUrl(path, 'station', 'subject', 'body'), '');
  }
  const cleaned = stationReportEmailUrl('/asia/viet-nam/demo', 'Demo https://audio.example/live?token=secret', 'Report', 'Problem');
  assert.doesNotMatch(decodeURIComponent(cleaned), /audio\.example|token=secret/);
});

test('compact player recovery hides internal details and keeps email and GitHub report options', async () => {
  const [recovery, player, expanded, contact] = await Promise.all([
    read('components/player/Recovery.vue'),
    read('components/player/Player.vue'),
    read('components/player/NowPlaying.vue'),
    read('pages/contact.vue'),
  ]);
  assert.match(recovery, /const showNotice = computed/);
  assert.match(recovery, /\['offline', 'exhausted', 'unsupported'\]/);
  assert.match(recovery, /const showReport = computed/);
  assert.match(recovery, /<details v-if="diagnostics\?\.sourceCount"/);
  assert.match(recovery, /:href="reportEmailUrl"/);
  assert.match(recovery, /:href="reportUrl"/);
  // Email and GitHub report options must share one responsive horizontal row.
  assert.match(recovery, /grid-cols-2 gap-1\.5/);
  assert.doesNotMatch(recovery, /flex flex-col gap-1 rounded-lg border/);
  assert.match(player, /stationReportEmailUrl\(/);
  assert.equal((player.match(/:report-email-url="reportEmailUrl"/g) || []).length, 3);
  assert.match(expanded, /reportEmailUrl: string/);
  assert.match(contact, /mailto:report@eplus\.dev/);
});

test('all seven languages have short listener-facing errors and email report labels', async () => {
  for (const lang of ['en-US', 'vi-VN', 'ja-JP', 'fr-FR', 'ru-RU', 'zh-CN', 'zh-TW']) {
    const dictionary = JSON.parse(await read('lang/' + lang + '.json'));
    for (const key of ['offline', 'unsupported', 'exhausted', 'report', 'change_source', 'report_email', 'report_github', 'details', 'email_subject', 'email_body']) {
      assert.ok(dictionary.recovery[key], lang + ' missing recovery.' + key);
    }
    assert.ok(dictionary.site_pages.contact.support.report_action);
    for (const key of ['offline', 'unsupported', 'exhausted']) {
      const message = dictionary.recovery[key];
      assert.ok(message.length < 170, lang + ' message is too long');
      assert.doesNotMatch(message, /decode|codec|HLS|sourceCount|retryAttempt|URL|token|stream|giải mã|trình duyệt/i);
    }
  }
});
