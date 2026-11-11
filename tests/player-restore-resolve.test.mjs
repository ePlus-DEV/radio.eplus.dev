import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('country station restored without sources can resolve on Play', async () => {
  const player = await read('components/player/Player.vue');
  assert.match(player, /const canResolveCountryStation = computed\(/);
  const resolveBlock = player.split('const canResolveCountryStation = computed(')[1]?.split('const canStartPlayback')[0];
  assert.ok(resolveBlock, 'canResolveCountryStation exists');
  assert.match(resolveBlock, /!hasPlayableSource\.value/);
  assert.match(resolveBlock, /!canRequestGlobalStream\.value/);
  assert.match(resolveBlock, /\/\^\\\/\[\^\\\/\]\+\\\/\[\^\\\/\]\+\\\/\[\^\\\/\]\+\$\//,
    'country URL pattern is exactly /area/country/id');
  assert.match(resolveBlock, /playback\.station\?\.url === props\.stationUrl/);
  assert.match(player, /const canStartPlayback = computed\(\(\) => hasPlayableSource\.value \|\| canResolveCountryStation\.value/);
  const onPlay = player.split('const onPlay = async (): Promise<void> => {')[1]?.split('const onPause')[0];
  assert.ok(onPlay, 'onPlay exists');
  assert.match(onPlay, /if \(!hasPlayableSource\.value\) \{/);
  assert.match(onPlay, /canRequestGlobalStream\.value \|\| canResolveCountryStation\.value/);
  assert.match(onPlay, /emit\('select-station', \{[\s\S]*?id: playback\.station\.id,[\s\S]*?title: playback\.station\.title,[\s\S]*?image: playback\.station\.image,[\s\S]*?url: playback\.station\.url,/);
});

test('Session resolves a restored country station in place before generic navigation', async () => {
  const session = await read('components/player/Session.vue');
  assert.match(session, /createPlaybackStation/);
  assert.match(session, /from '~\/utils\/playback-station\.mjs'/);
  assert.match(session, /useRuntimeConfig\(\)/);
  const resolveIdx = session.indexOf('resolveCountryStationInPlace');
  const genericIdx = session.indexOf('playback.requestStation(target.url)');
  assert.ok(resolveIdx >= 0, 'in-place country resolver exists');
  // The generic navigation call inside the fallback is after the resolver;
  // the primary generic navigation block must come after the in-place branch.
  const inPlaceBranchIdx = session.indexOf("target.url === playback.station?.url");
  assert.ok(inPlaceBranchIdx >= 0 && inPlaceBranchIdx < session.lastIndexOf('playback.requestStation(target.url)'),
    'in-place branch is checked before generic country navigation');
  const resolver = session.split('const resolveCountryStationInPlace')[1]?.split('const selectStation')[0];
  assert.ok(resolver, 'resolver body exists');
  assert.match(resolver, /siteAssetUrl\(`\/radio\/\$\{area\}\/\$\{country\}\.json`\)/);
  assert.match(resolver, /timeout: 10_000/);
  assert.match(resolver, /meta\?\.stream|meta\.stream/);
  assert.match(resolver, /Object\.entries\(catalog\)/);
  assert.match(resolver, /entry\.features \|\| '\/brand\/onair-mark\.svg'/);
  assert.match(resolver, /createPlaybackStation\(\{/);
  assert.match(resolver, /corsServer: String\(config\.public\.corsServer \|\| ''\)/);
  assert.match(resolver, /placeholder: '\/brand\/onair-mark\.svg'/);
  assert.match(resolver, /playback\.activate\([\s\S]*?\{ autoplay: true \}\)/);
  const branch = session.split("if (target.url === playback.station?.url")[1]?.split('// Country queue navigation remains unchanged')[0];
  assert.ok(branch, 'in-place branch exists');
  assert.match(branch, /!playback\.station\?\.sources\?\.length/);
  assert.match(branch, /!target\.url\.startsWith\('\/global-radio\/'\)/);
  assert.match(branch, /resolveCountryStationInPlace\(target, isCurrent\)/);
  assert.match(branch, /if \(resolved \|\| !isCurrent\(\)\) return;/,
    'stale resolution must not trigger fallback navigation');
});

test('slow connecting hint is wired through Recovery with report hidden for connecting', async () => {
  const player = await read('components/player/Player.vue');
  const recovery = await read('components/player/Recovery.vue');
  assert.match(player, /:connecting-slow="slowConnecting"/);
  assert.match(player, /health !== 'connecting' \|\| slowConnecting/);
  assert.match(recovery, /connectingSlow\?: boolean/);
  assert.match(recovery, /isConnectingSlow/);
  assert.match(recovery, /recovery\.connecting_slow/);
  assert.match(recovery, /showReport = computed\(\(\) => props\.online && \['exhausted', 'unsupported'\]/,
    'report remains limited to exhausted/unsupported');
  for (const locale of ['en-US', 'vi-VN', 'ja-JP', 'zh-CN', 'zh-TW', 'fr-FR', 'ru-RU']) {
    const lang = JSON.parse(await read(`lang/${locale}.json`));
    assert.equal(typeof lang.recovery.connecting_slow, 'string', locale);
    assert.match(lang.recovery.connecting_slow, /\{attempt\}/, locale);
    assert.match(lang.recovery.connecting_slow, /\{limit\}/, locale);
  }
});
