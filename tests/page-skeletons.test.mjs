import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pageSkeletonKind } from "../utils/page-skeleton.mjs";

test("all public page families have route-specific skeletons", () => {
  for (const [path, variant] of [
    ["/", "home"],
    ["/europe", "area"],
    ["/asia/", "area"],
    ["/asia/viet-nam", "country"],
    ["/asia/viet-nam/vov-gt-hcm", "station"],
    ["/europe/united-kingdom/heart-uk", "station"],
    ["/library", "library"],
    ["/library#favorites", "library"],
    ["/statistics", "statistics"],
    ["/settings", "settings"],
    ["/settings/?from=menu#appearance", "settings"],
    ["/global-radio", "global-radio"],
    ["/global-radio/", "global-radio"],
    ["/global-radio/apple-music", "global-radio-provider"],
    ["/global-radio/apple-music/", "global-radio-provider"],
    ["/global-radio/apple-music/apple-music-1", "global-radio-station"],
    ["/global-radio/apple-music/apple-music-hits?ref=home", "global-radio-station"],
    ["/global-radio/unavailable", "info"],
    ["/about", "info"],
    ["/contact", "info"],
    ["/privacy-policy", "info"],
    ["/terms-of-use", "info"],
    ["/cookie-policy", "info"],
    ["/unexpected/other/route/extra", "info"],
  ]) {
    assert.equal(pageSkeletonKind(path), variant, path);
  }
});

test("skeleton component mirrors real page layouts, remains noninteractive and screen-reader friendly", async () => {
  const source = await readFile("components/PageSkeleton.vue", "utf8");
  for (const variant of ["home", "area", "country", "station", "library", "statistics", "settings", "global-radio", "global-radio-provider", "global-radio-station"]) {
    assert.ok(source.includes("variant === '" + variant + "'"), variant);
  }
  assert.match(source, /role="status"/);
  assert.match(source, /aria-busy="true"/);
  assert.match(source, /aria-hidden="true"/);
  assert.match(source, /sr-only/);
  assert.doesNotMatch(source, /<NuxtLink|<button|<img|\\$fetch|createPlaybackStation/);
  assert.match(source, /grid-cols-2/);
  assert.match(source, /lg:grid-cols-/);
  assert.match(source, /radio-hero/);
  assert.match(source, /sm:grid-cols-2/);
});

test("Library renders responsive skeleton content on direct SSR and navigation without duplicating its header", async () => {
  const library = await readFile("pages/library.vue", "utf8");
  const page = await readFile("components/PageSkeleton.vue", "utf8");
  const skeleton = await readFile("components/LibraryContentSkeleton.vue", "utf8");

  assert.match(library, /<ClientOnly>/);
  assert.match(library, /<LibraryContentSkeleton :tab="active"/);
  assert.doesNotMatch(library, /<p class="radio-surface p-5 text-sm[^>]*>\{\{ \$t\('library\.loading'\)/);
  assert.match(page, /<LibraryContentSkeleton tab="all" :announce="false"/);
  assert.match(page, /radio-library-tabs/);
  assert.match(skeleton, /radio-library-content-skeleton/);
  for (const tab of ["all", "favorites", "stats"]) {
    assert.match(skeleton, new RegExp("tab === '" + tab + "'"));
  }
  assert.match(skeleton, /\['favorites', 'recent'\]/);
  assert.match(skeleton, /tab === 'collections' \|\| tab === 'custom'/);
  assert.match(skeleton, /role="status"|:role="announce \? 'status'/);
  assert.match(skeleton, /aria-busy="true"/);
  assert.match(skeleton, /aria-hidden="true"/);
  assert.match(skeleton, /sr-only/);
  assert.match(skeleton, /grid-cols-2/);
  assert.match(skeleton, /sm:grid-cols-2/);
  assert.match(skeleton, /md:grid-cols-4/);
  assert.doesNotMatch(skeleton, /<NuxtLink|<button|<img|\$fetch/);
});

test("app skeleton is client-only, delayed, cancels on route failures and keeps global player mounted", async () => {
  const source = await readFile("app.vue", "utf8");
  assert.match(source, /<NuxtPage\s*\/>/);
  assert.match(source, /<PageSkeleton v-if="pageIsLoading" :path="pendingPagePath"/);
  assert.match(source, /v-show="!pageIsLoading"/);
  assert.match(source, /:inert="pageIsLoading"/);
  assert.match(source, /router\.beforeEach/);
  assert.match(source, /to\.path === from\.path/);
  assert.match(source, /setTimeout\(\(\) => \{ pageIsLoading\.value = true; \}, 140\)/);
  assert.match(source, /nuxtApp\.hook\("page:finish", stopPageSkeleton\)/);
  assert.match(source, /router\.onError\(stopPageSkeleton\)/);
  assert.match(source, /onBeforeUnmount/);
  assert.match(source, /<PlayerSession\s*\/>/);
  assert.doesNotMatch(source, /v-if="!pageIsLoading"[\s\S]*?<NuxtPage/);
});

test("shimmer supports light/dark themes and disables animation for reduced motion", async () => {
  const css = await readFile("assets/css/main.css", "utf8");
  assert.match(css, /@keyframes radio-skeleton-shimmer/);
  assert.match(css, /var\(--radio-surface-soft\)/);
  assert.match(css, /var\(--radio-border-strong\)/);
  assert.match(css, /prefers-reduced-motion: reduce[\s\S]*?\.radio-skeleton\s*\{\s*animation: none/);
});
