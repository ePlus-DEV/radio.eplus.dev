import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { addCollectionStation, moveCollectionStation, parseCollections, serializeCollections, exportCollections, parseCollectionsFile, COLLECTIONS_LIMIT, COLLECTION_STATIONS_LIMIT, COLLECTIONS_FILE_LIMIT } from '../utils/personal-collections.mjs';

const a = { url: '/asia/viet-nam/a', title: 'A', image: '/a.png' };
const b = { url: '/europe/france/b', title: 'B', image: '/b.png' };
test('local collections add, deduplicate, reorder and roundtrip without streams', () => {
  let list = { id: '1', name: 'My stations', stations: [] };
  list = addCollectionStation(list, { ...a, stream: 'https://secret.test/stream' });
  list = addCollectionStation(list, a);
  list = addCollectionStation(list, b);
  assert.deepEqual(list.stations.map(s => s.url), [a.url, b.url]);
  list = moveCollectionStation(list, 1, -1);
  assert.deepEqual(list.stations.map(s => s.url), [b.url, a.url]);
  const raw = serializeCollections([list]);
  assert.doesNotMatch(raw, /secret|stream/);
  assert.deepEqual(parseCollections(raw), [list]);
});
test('export contains only station routes; import rejects malformed or unsafe input', () => {
  const output = exportCollections([{ id: '1', name: 'Test', stations: [a, b] }]);
  assert.doesNotMatch(output, /a.png|https:/);
  assert.deepEqual(parseCollectionsFile(output), [{ name: 'Test', stations: [a.url, b.url] }]);
  for (const raw of ['bad', '{}', JSON.stringify({ format:'eplus-onair-collections', version:1, collections:[{ name:'X', stations:['https://evil.test'] }] })]) assert.throws(() => parseCollectionsFile(raw));
  assert.throws(() => parseCollections('{"version":1,"collections":[{}]}'));
  assert.deepEqual(parseCollections(null), []);
});

test('invalid stored stations are rejected instead of silently discarded', () => {
  assert.throws(() => parseCollections(JSON.stringify({ version: 1, collections: [{ id: '1', name: 'X', stations: [{ url: 'https://private.test', title: 'X' }] }] })));
  assert.throws(() => parseCollections(JSON.stringify({ version: 1, collections: [{ id: '1', name: 'X'.repeat(81), stations: [] }] })));
  assert.throws(() => parseCollectionsFile('x'.repeat(COLLECTIONS_FILE_LIMIT + 1)));
});

test('add and reorder reject unsupported stations and out-of-range moves', () => {
  const list = { id: '1', name: 'X', stations: [a] };
  assert.equal(addCollectionStation(list, { url: '/global-radio/apple-music/apple-music-1', title: 'A' }), list);
  assert.equal(moveCollectionStation(list, 0, -1), list);
  assert.equal(moveCollectionStation(list, 0, 1), list);
  assert.equal(moveCollectionStation(list, 0, 2), list);
});

test('maximum permitted export remains importable', () => {
  const collections = Array.from({ length: COLLECTIONS_LIMIT }, (_, i) => ({ name: `List ${i}`, stations:
    Array.from({ length: COLLECTION_STATIONS_LIMIT }, (_, j) => ({ url: `/asia/viet-nam/${'x'.repeat(170)}-${j}`, title: 'X' })) }));
  assert.equal(parseCollectionsFile(exportCollections(collections)).length, COLLECTIONS_LIMIT);
});

test('all supported locales provide collection actions and recovery guidance', async () => {
  for (const locale of ['en-US', 'vi-VN', 'ja-JP', 'zh-CN', 'zh-TW', 'fr-FR', 'ru-RU']) {
    const data = JSON.parse(await readFile(new URL(`../lang/${locale}.json`, import.meta.url), 'utf8'));
    for (const key of ['title', 'description', 'name', 'create', 'rename', 'delete', 'save', 'cancel', 'choose_station', 'add', 'add_hint', 'empty', 'empty_stations', 'move_up', 'move_down', 'remove', 'confirm_delete', 'confirm_delete_description', 'export', 'import', 'storage_error', 'corrupt', 'import_error', 'import_done', 'backup_damaged', 'reset_damaged', 'reset_description', 'edit_stations', 'done_editing', 'play_all']) {
      assert.ok(typeof data.collections?.[key] === 'string' && data.collections[key].trim(), `${locale}: ${key}`);
    }
    assert.match(data.collections.import_done, /\{count\}/);
    assert.match(data.collections.import_done, /\{missing\}/);
  }
});
