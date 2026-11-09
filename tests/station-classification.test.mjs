import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
  RADIO_AREAS, RADIO_CONTENT_GROUPS,
  classifyRadioContent, stationClassificationRecord, radioBroadcastBand,
} from '../utils/station-classification.mjs';
import { auditRadioClassification } from '../scripts/audit-radio-classification.mjs';
import { buildStationSearchIndex } from '../scripts/build-station-search-index.mjs';

const groups = (station, opts) => classifyRadioContent(station, opts).groups;

test('genre classification uses reported category/tags, not title or country guesses', () => {
  assert.deepEqual(groups({title:'Jazz FM', stream:'https://example.test/live.mp3'}), ['unknown']);
  assert.deepEqual(groups({title:'News FM', category:'BBC Radio 1'}), ['unknown']);
  assert.deepEqual(groups({title:'Bà Rịa-Vũng Tàu', category:'Bà Rịa-Vũng Tàu'}), ['unknown']);
  assert.deepEqual(groups({title:'VOV 1', category:'Thời sự'}), ['news']);
  assert.deepEqual(groups({title:'VOV 3', category:'Âm nhạc'}), ['music']);
  assert.deepEqual(groups({title:'VOV Giao Thông', category:'Giao Thông'}), ['traffic']);
  assert.deepEqual(groups({title:'VOV 4', category:'Ban Dân Tộc'}), ['community']);
  assert.deepEqual(groups({title:'VOV 5', category:'Ban Đối Ngoại'}), ['international']);
  assert.deepEqual(groups({category:'Sport'}), ['sports']);
});

test('imported concise catalog tags support multiple subject groups and music genres', () => {
  const result = classifyRadioContent({description:'news, talk, classic rock, jazz'});
  assert.deepEqual(result.groups, ['music', 'news', 'talk']);
  assert.deepEqual(result.genres, ['jazz', 'rock']);
  assert.deepEqual(result.evidence, ['catalog-tags']);
  assert.deepEqual(groups({description:'An excellent rock station with daily news. Not verified!'}), ['unknown']);
  assert.deepEqual(groups({description:'rock'}), ['music']);
  assert.deepEqual(groups({description:'country, london, nationwide'}), ['music']);
});

test('reviewed exceptions correct misleading catalog category values', () => {
  assert.deepEqual(groups({category:'Giao Thông'}, {path:'/asia/viet-nam/vov-suc-khoe'}), ['health']);
  assert.deepEqual(groups({category:'Giao Thông'}, {path:'/asia/viet-nam/vov-mekong'}), ['community']);
  assert.deepEqual(groups({category:'Ban Dân Tộc'}, {path:'/asia/viet-nam/vov-english'}), ['international']);
  assert.deepEqual(groups({category:'Âm nhạc'}, {path:'/europe/united-kingdom/talk'}), ['unknown']);
  assert.deepEqual(groups({category:'Âm nhạc'}, {path:'/europe/united-kingdom/bbc-glasgow'}), ['unknown']);
});

test('provider genre is explicitly reported; geographic routes and radio band are independent', () => {
  const provider = classifyRadioContent({title:'Apple Music Club', language:'en'}, {path:'/global-radio/apple-music/apple-music-club',providerGenre:'Electronic'});
  assert.deepEqual(provider.groups, ['music']);
  assert.deepEqual(provider.genres, ['electronic']);
  assert.equal(provider.language, 'en');
  const a = stationClassificationRecord('/asia/viet-nam/vov1', {title:'VOV 1', category:'Thời sự', signal:'91 FM'});
  assert.equal(a.area, 'asia'); assert.equal(a.country, 'viet-nam'); assert.equal(a.provider, '');
  assert.equal(a.broadcastBand, 'fm');
  assert.equal(radioBroadcastBand({signal:'610 AM'}), 'am');
  assert.equal(radioBroadcastBand({signal:'Stream'}), 'unknown');
  const global = stationClassificationRecord('/global-radio/apple-music/apple-music-club',
    {title:'Apple Music Club', language:'en'}, 'Electronic');
  assert.equal(global.country, '');
  assert.equal(global.provider, 'apple-music');
  assert.ok(RADIO_AREAS.includes(global.area));
  assert.ok(global.groups.every(g=>RADIO_CONTENT_GROUPS.includes(g)));
  assert.throws(()=> stationClassificationRecord('//bad/path', {title:'Bad'}));
});

test('entire current catalog has an auditable inventory without stream URLs or made-up genres', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'onair-classification-'));
  try {
    const csvOutput=join(dir,'station-classification.csv');
    const summaryOutput=join(dir,'summary.json');
    const {records,summary}=await auditRadioClassification({csvOutput,summaryOutput});
    assert.ok(records.length>=4200, 'all country catalogs and Global Radio must be included');
    assert.equal(summary.total, records.length);
    assert.equal(summary.globalProviderStations, 7);
    assert.equal(summary.geographicStations+summary.globalProviderStations, summary.total);
    assert.equal(new Set(records.map(r=>r.path)).size, records.length);
    assert.ok(summary.declaredCategory>0);
    assert.equal(summary.declaredLanguage, 7, 'only Global Radio currently declares explicit languages');
    assert.equal(summary.awaitingContentReview+summary.contentClassified,summary.total);
    assert.ok(summary.awaitingContentReview>0, 'missing evidence must stay visible');
    assert.ok(Object.values(summary.countByArea).every(n=>n>0));
    assert.ok(records.every(r=>r.groups.length && r.groups.every(g=>RADIO_CONTENT_GROUPS.includes(g))));
    assert.equal(records.find(r=>r.path==='/asia/viet-nam/vov1')?.groups[0], 'news');
    assert.equal(records.find(r=>r.path==='/asia/viet-nam/vov-suc-khoe')?.groups[0], 'health');
    const csv=await readFile(csvOutput,'utf8');
    assert.equal(csv.trimEnd().split('\n').length,records.length+1);
    assert.doesNotMatch(csv,/https?:\/\/[^\s,"]+\.(?:m3u8|mp3|aac)|accessKey|signedToken/i);
    assert.equal(JSON.parse(await readFile(summaryOutput,'utf8')).total,records.length);
  } finally { await rm(dir,{recursive:true,force:true}); }
});

test('search index carries classifications without changing canonical station identity', async () => {
  const dir=await mkdtemp(join(tmpdir(),'onair-classified-search-'));
  try{
    const radioRoot=join(dir,'radio');
    await mkdir(join(radioRoot,'asia'),{recursive:true});
    await writeFile(join(radioRoot,'asia','viet-nam.json'),JSON.stringify({
      'vov1':{title:'VOV 1',category:'Thời sự',stream:'https://stream.test/secret.mp3'},
      'jazz-example':{title:'Jazz FM',stream:'https://stream.test/secret2.mp3'},
      'genre-example':{title:'Example',description:'news, jazz',stream:'https://stream.test/secret3.mp3'},
    }));
    const out=join(dir,'index.json');
    const result=await buildStationSearchIndex({radioRoot,providerRoot:join(dir,'not-present'),outputFile:out});
    assert.equal(result.length,3);
    assert.deepEqual(result.find(x=>x.url.endsWith('/vov1')).station_groups,['news']);
    assert.deepEqual(result.find(x=>x.url.endsWith('/jazz-example')).station_groups,['unknown']);
    assert.deepEqual(result.find(x=>x.url.endsWith('/genre-example')).station_groups,['music','news']);
    assert.deepEqual(result.find(x=>x.url.endsWith('/genre-example')).station_genres,['jazz']);
    assert.doesNotMatch(await readFile(out,'utf8'),/secret\d?\.mp3/);
  }finally{await rm(dir,{recursive:true,force:true});}
});
