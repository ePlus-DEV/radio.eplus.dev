import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../components/player/Player.vue', import.meta.url), 'utf8');
function handler(name, context) {
  const body = source.match(new RegExp(`const ${name} = \\(\\): void => \\{([\\s\\S]*?)\\n\\};`))?.[1];
  assert.ok(body, `missing ${name}`);
  return new Function(...Object.keys(context), body).bind(null, ...Object.values(context));
}
test('waiting clears actual-playing state and starts bounded recovery only with play intent', () => {
  let stops = 0, probes = 0;
  const playing = { value: true }, waiting = { value: false }, userPaused = { value: false };
  const run = handler('onMediaWaiting', { playing, waiting, userPaused,
    stopListeningDuration: () => stops++, startFallbackProbe: () => probes++ });
  run();
  assert.equal(playing.value, false);
  assert.equal(waiting.value, true);
  assert.equal(stops, 1);
  assert.equal(probes, 1);
  userPaused.value = true;
  waiting.value = false;
  run();
  assert.equal(waiting.value, false);
  assert.equal(probes, 1);
});
test('network stall preserves buffered playback and only recovers when data runs out', () => {
  let waits = 0;
  const mediaElement = { value: { readyState: 4 } };
  const run = handler('onMediaStalled', { mediaElement, onMediaWaiting: () => waits++ });
  run();
  assert.equal(waits, 0);
  mediaElement.value.readyState = 2;
  run();
  assert.equal(waits, 1);
});
