import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('custom stream form is confined to client-only Library and never becomes a public SEO route', async () => {
  const [library, component] = await Promise.all([
    read('pages/library.vue'), read('components/panel/CustomRadioStreams.vue'),
  ]);
  assert.match(library, /<ClientOnly>/);
  assert.match(library, /<PanelCustomRadioStreams v-if="active === 'all'"/);
  assert.match(library, /'noindex, follow'/);
  assert.doesNotMatch(library, /custom-streams\.json|pages\/custom-stream/);
  assert.match(component, /autocomplete="off" maxlength="96"/);
  assert.match(component, /type="url" inputmode="url"/);
  assert.match(component, /@submit\.prevent="submit"/);
  assert.match(component, /v-model:open="resetOpen"/);
  assert.match(component, /:open="Boolean\(deleteUrl\)"/);
  assert.match(component, /@click="confirmDelete"/);
  assert.match(component, /parseCustomStreams\(raw\)/);
  assert.match(component, /serializeCustomStreams\(next\)/);
  assert.match(component, /addCustomStream\(records\.value, input\)/);
  assert.match(component, /editCustomStream\(records\.value, editingUrl\.value, input\)/);
  assert.match(component, /removeCustomStream\(records\.value, deleteUrl\.value\)/);
});

test('storage changes invalidate stale imports, damaged data is preserved for manual recovery', async () => {
  const component = await read('components/panel/CustomRadioStreams.vue');
  assert.match(component, /window\.addEventListener\('storage', onStorage\)/);
  assert.match(component, /window\.removeEventListener\('storage', onStorage\)/);
  assert.match(component, /generation \+= 1; \/\/ Invalidate an in-flight file read/);
  assert.match(component, /parsed\.length !== data\.streams\.length/);
  assert.match(component, /rawBackup\.value = raw/);
  assert.match(component, /if \(!broken\.value \|\| current !== rawBackup\.value\)/);
  assert.match(component, /file\.size > 100_000/);
  assert.match(component, /version !== 1 \|\| !Array\.isArray\(data\.streams\)/);
  assert.doesNotMatch(component, /\$fetch\(|fetch\(|XMLHttpRequest|corsServer|new Audio\(|\.play\(\)/);
  assert.match(component, /usePlaybackStore\(\)/);
  assert.match(component, /@click="togglePlayback\(stream\)"/);
  assert.doesNotMatch(component, /sendBeacon|gtag|analytics|localStorage\.setItem\((?!CUSTOM_STREAMS_STORAGE_KEY)/);
});

test('seven locales cover all stream-manager controls, errors and caveats', async () => {
  for (const locale of ['vi-VN','en-US','fr-FR','ja-JP','ru-RU','zh-CN','zh-TW']) {
    const dictionary = JSON.parse(await read('lang/' + locale + '.json'));
    const messages = dictionary.custom_streams;
    assert.ok(messages, locale);
    for (const key of [
      'title','description','name','url','add','save','cancel','edit','delete',
      'export','import','empty','disclaimer','format_hint','unverified','http_warning',
      'saved','deleted','import_done','confirm_delete','confirm_delete_description',
      'damaged','backup','reset','reset_description','storage_error','import_error'
    ]) assert.ok(typeof messages[key] === 'string' && messages[key].trim(), locale + '.' + key);
    for (const key of [
      'invalid_title','invalid_url','invalid_protocol','unsafe_url','credential_url',
      'unsupported_format','duplicate','limit','not_found'
    ]) assert.ok(messages.errors[key], locale + '.errors.' + key);
    assert.match(messages.import_done, /\{count\}/);
    assert.match(messages.import_done, /\{skipped\}/);
    assert.ok(dictionary.collections?.title && dictionary.library?.favorites, locale + ' retains existing translations');
  }
});

test('no custom stream is sent to default catalog, indexed search or station pages', async () => {
  const component = await read('components/panel/CustomRadioStreams.vue');
  assert.doesNotMatch(component, /public\/radio|world\.json|useStationSearchIndex|buildRadioStationSchema|useHead|navigateTo/);
  assert.match(component, /CUSTOM_STREAMS_STORAGE_KEY/);
  assert.match(component, /role="alert"/);
  assert.match(component, /role="status"/);
  assert.match(component, /--radio-surface-soft/);
});
