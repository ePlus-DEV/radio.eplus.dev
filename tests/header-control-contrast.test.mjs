import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('theme and language controls share high-contrast header treatment', async () => {
  const [theme, language, styles, header] = await Promise.all([
    read('components/theme/DarkMode.vue'),
    read('components/lang/LangSwitcher.vue'),
    read('assets/css/main.css'),
    read('components/AppHeader.vue'),
  ]);
  assert.match(header, /<ThemeDarkMode\s*\/>\s*<LangSwitcher\s*\/>/);
  for (const component of [theme, language]) {
    assert.match(component, /<UButton[^>]*radio-header-action/);
    assert.match(component, /color="neutral" variant="ghost"/);
    assert.match(component, /h-11/);
  }
  assert.match(styles, /\.radio-header-action\s*\{[^}]*color: var\(--radio-text\) !important;[^}]*background: var\(--radio-surface-soft\) !important;/s);
  assert.match(styles, /html\.dark \.radio-header-action,[\s\S]*?html\[data-theme="dark"\] \.radio-header-action\s*\{[^}]*color: #f8fafc !important;[^}]*background: rgb\(255 255 255 \/ 0\.12\) !important;/s);
  assert.match(styles, /html\.dark \.radio-header-action:hover,[\s\S]*?background: rgb\(255 255 255 \/ 0\.20\) !important;/s);
  assert.match(styles, /\.radio-header-action:focus-visible\s*\{[^}]*outline: 2px solid #f43f5e;/s);
});

test('header controls preserve existing dropdown functionality', async () => {
  const [theme, language] = await Promise.all([
    read('components/theme/DarkMode.vue'),
    read('components/lang/LangSwitcher.vue'),
  ]);
  assert.match(theme, /v-model:open="open"/);
  assert.match(theme, /colorMode\.preference = option\.value/);
  assert.match(language, /v-model:open="open"/);
  assert.match(language, /await setLocale\(code\)/);
});
