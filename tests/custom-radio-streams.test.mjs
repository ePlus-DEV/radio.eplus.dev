import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CUSTOM_STREAMS_STORAGE_KEY, MAX_CUSTOM_STREAMS,
  validateCustomStream, normalizeCustomStreams, parseCustomStreams,
  serializeCustomStreams, addCustomStream, editCustomStream, removeCustomStream,
} from '../utils/custom-radio-streams.mjs';

const draft = (url, title = 'My public radio') => ({ title, url });

test('public HTTPS streams are hints, not verified live statuses', () => {
  assert.equal(CUSTOM_STREAMS_STORAGE_KEY, 'radio:custom-streams:v1');
  assert.deepEqual(validateCustomStream(draft('https://radio.example.org/live.mp3')), {
    ok:true, stream:{title:'My public radio',url:'https://radio.example.org/live.mp3',format:'mp3'},
    warning:'not_verified',
  });
  for (const [suffix, format] of [['.m3u8','hls'],['.aac','aac'],['.ogg','ogg'],['.pls','playlist']]) {
    assert.equal(validateCustomStream(draft('https://radio.example.org/live'+suffix)).stream.format,format);
  }
  assert.equal(validateCustomStream(draft('https://radio.example.org/live')).stream.format,'unknown');
  assert.equal(validateCustomStream(draft('http://radio.example.org:8000/live')).warning,'mixed_content_possible');
});

test('reject local, private and numeric hosts, executable schemes and URL credentials', () => {
  for (const url of [
    'javascript:alert(1)','file:///etc/passwd','data:audio/mp3;base64,abc',
    'http://localhost:8000/live.mp3','http://router.local/live','http://radio.internal/live',
    'http://radio.lan/live','http://router/live','http://127.0.0.1/',
    'http://192.168.1.1/live','http://0x7f000001/','http://2130706433/',
    'http://[::1]/','http://[fc00::1]/',
    'https://user:pass@radio.example.org/live','https://radio.example.org/live#secret',
  ]) assert.equal(validateCustomStream(draft(url)).ok,false,url);
});

test('reject known secret query keys and omit sensitive values from errors', () => {
  for (const key of ['token','access_key','api-key','auth','jwt','signature','session','pwd','expires']) {
    const result=validateCustomStream(draft('https://radio.example.org/live.mp3?'+key+'=secret-value'));
    assert.deepEqual(result,{ok:false,reason:'credential_url'},key);
    assert.equal(JSON.stringify(result).includes('secret-value'),false);
  }
  assert.equal(validateCustomStream(draft('https://radio.example.org/live?channel=2')).ok,true);
});

test('malformed URLs and non-audio files or unsafe names fail closed', () => {
  for (const url of ['','not a URL','https://radio.example.org/info.html',
    'https://radio.example.org/data.json','https://radio.example.org/app.js',
    'https://radio.example.org/live\nmore','https://radio.example.org/a\\b']) {
    assert.equal(validateCustomStream(draft(url)).ok,false,url);
  }
  for (const title of ['', '   ', '<script>', 'A'.repeat(97), 'abc\ndef']) {
    assert.deepEqual(validateCustomStream(draft('https://radio.example.org/live',title)),
      {ok:false,reason:'invalid_title'});
  }
});

test('add, edit, duplicate prevention, delete and export/import are deterministic', () => {
  const a='https://radio.example.org/a.mp3';
  const b='https://radio.example.org/b.aac';
  let result=addCustomStream([],draft(a,'A'));
  assert.equal(result.ok,true);
  assert.equal(addCustomStream(result.streams,draft(a,'Duplicate')).reason,'duplicate');
  result=addCustomStream(result.streams,draft(b,'B'));
  assert.equal(result.streams.length,2);
  assert.equal(editCustomStream(result.streams,a,draft(b,'Collision')).reason,'duplicate');
  const changed=editCustomStream(result.streams,a,draft(a,'Renamed'));
  assert.equal(changed.ok,true);
  assert.deepEqual(changed.streams.map(x=>x.title),['Renamed','B']);
  assert.equal(editCustomStream(changed.streams,'https://missing.example.org/',draft(a)).reason,'not_found');
  assert.deepEqual(parseCustomStreams(serializeCustomStreams(changed.streams)),changed.streams);
  assert.deepEqual(removeCustomStream(changed.streams,a).map(x=>x.title),['B']);
});

test('bad imports, old schemas and injected credentials never reach local library', () => {
  for (const raw of ['{bad','[]',JSON.stringify({version:2,streams:[]}), 'a'.repeat(100001)]) {
    assert.deepEqual(parseCustomStreams(raw),[]);
  }
  const imported=JSON.stringify({version:1,streams:[
    draft('https://radio.example.org/a.mp3','Good'),
    draft('https://radio.example.org/a.mp3','Duplicate'),
    draft('https://radio.example.org/live?token=secret','Bad'),
    draft('http://localhost/stream','Private'),
  ]});
  assert.deepEqual(parseCustomStreams(imported),[
    {title:'Good',url:'https://radio.example.org/a.mp3',format:'mp3'},
  ]);
});

test('bounded storage never creates public metadata or performs requests', () => {
  const rows=Array.from({length:MAX_CUSTOM_STREAMS+20},(_,i)=>
    draft('https://radio.example.org/live/'+i,'Radio '+i));
  const normalized=normalizeCustomStreams(rows);
  assert.equal(normalized.length,MAX_CUSTOM_STREAMS);
  assert.equal(addCustomStream(normalized,draft('https://radio.example.org/extra')).reason,'limit');
  assert.deepEqual(Object.keys(normalized[0]).sort(),['format','title','url']);
  const payload=JSON.parse(serializeCustomStreams(rows));
  assert.equal(payload.version,1);
  assert.equal(payload.streams.length,MAX_CUSTOM_STREAMS);
});
