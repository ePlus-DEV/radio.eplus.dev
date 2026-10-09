import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

function luminance(hex) {
  const channels = [1, 3, 5].map(offset => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const rgb = channels.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('homepage promotes featured stations ahead of personalized sections', async () => {
  const source = await read('pages/index.vue');
  assert.ok(source.indexOf('id="featured-radio"') > source.indexOf('class="radio-hero'));
  assert.ok(source.indexOf('id="featured-radio"') < source.indexOf('<PanelResumeCard'));
  assert.ok(source.indexOf('id="featured-radio"') < source.indexOf('<PanelListeningLibrary compact'));
  assert.ok(source.indexOf('id="explore-radio"') > source.indexOf('<PanelListeningLibrary compact'));
  assert.match(source, /text-rose-700 dark:text-rose-300/);
});

test('compact Favorites / Recently played omit empty sections without removing full-library empty guidance', async () => {
  const source = await read('components/panel/ListeningLibrary.vue');
  assert.match(source, /<div v-if="groups.length" class="space-y-7">/);
  assert.match(source, /\(!props\.compact \|\| group\.items\.length > 0\)/);
  assert.match(source, /group\.key === 'recent'/);
  assert.match(source, /<p v-else class="rounded-2xl border border-dashed/);
  assert.match(source, /@click="togglePlayback\(station, group\.items\)"/);
});

test('dark secondary text and cards have clear, accessible contrast', async () => {
  const css = await read('assets/css/main.css');
  const dark = css.match(/html\.dark,\s*html\[data-theme="dark"\]\s*\{([\s\S]*?)\n\s*\}/)?.[1];
  assert.ok(dark, 'dark color tokens defined');
  const token = name => {
    const value = dark.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`))?.[1];
    assert.ok(value, `Missing token: ${name}`);
    return value;
  };
  const surface = token('radio-surface');
  const muted = token('radio-text-muted');
  const primary = token('radio-text');
  assert.ok(contrast(muted, surface) >= 7, 'secondary text should remain visible even in small UI');
  assert.ok(contrast(primary, surface) >= 7, 'main text should remain legible');
  assert.notEqual(token('radio-page-bg'), surface, 'cards must separate from the page background');
  assert.match(dark, /--radio-border:\s*rgb\(221 230 245 \/ 0\.16\)/);
});
