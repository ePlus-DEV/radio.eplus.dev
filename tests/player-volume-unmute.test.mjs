import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../components/player/Player.vue', import.meta.url), 'utf8');
const match = source.match(/const toggleMute = \(\): void => \{([\s\S]*?)\n\};/);
assert.ok(match, 'toggleMute must remain available');

function toggle(media, systemVolumeOnly = false) {
  const mediaElement = { value: media };
  const volumeControl = { value: systemVolumeOnly };
  const body = match[1].replaceAll('systemVolumeOnly.value', 'volumeControl.value');
  new Function('mediaElement', 'volumeControl', body)(mediaElement, volumeControl);
}

test('unmuting from zero restores audible volume', () => {
  const media = { volume: 0, muted: false };
  toggle(media);
  assert.equal(media.volume, 1);
  assert.equal(media.muted, false);
});

test('unmuting an explicitly muted nonzero volume preserves its level', () => {
  const media = { volume: 0.35, muted: true };
  toggle(media);
  assert.equal(media.volume, 0.35);
  assert.equal(media.muted, false);
});

test('muting audible media does not alter its saved volume', () => {
  const media = { volume: 0.65, muted: false };
  toggle(media);
  assert.equal(media.volume, 0.65);
  assert.equal(media.muted, true);
});

test('system-volume-only devices do not receive a programmatic volume assignment', () => {
  const media = { volume: 0, muted: true };
  toggle(media, true);
  assert.equal(media.volume, 0);
  assert.equal(media.muted, false);
});
