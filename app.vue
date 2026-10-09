<template>
  <UApp :locale="uiLocale" :toaster="null">
  <div :class="{ 'radio-shell-queue': clientReady && playback.station && playback.queueOpen }" class="radio-shell min-h-screen w-full overflow-x-clip bg-[var(--radio-page-bg)] text-[var(--radio-text)] transition-colors">
    <AppHeader />
    <div class="radio-app-content mx-auto w-full max-w-[1920px] xl:grid xl:grid-cols-[224px_minmax(0,1fr)] xl:gap-6 xl:px-6">
      <AppSidebar />
      <main
        class="mx-auto w-full min-w-0 max-w-7xl px-4 pb-14 pt-20 sm:px-6 sm:pt-28 xl:px-0"
        id="main-content"
        scroll-container
      >
        <NuxtPage />
      </main>
      <div id="radio-queue-slot" class="radio-queue-slot hidden min-h-0 min-w-0 pb-14 pt-24"></div>
    </div>
    <AppFooter />
    <MobileNavigation />
    <ClientOnly>
      <PlayerSession />
      <template #fallback>
        <div class="radio-player-dock fixed inset-x-0 bottom-0 z-[60] border-t border-[var(--radio-border)] bg-[var(--radio-surface-elevated)]" aria-hidden="true">
          <div class="mx-auto flex min-h-[96px] max-w-[1920px] items-center gap-4 px-3 sm:grid sm:grid-cols-[minmax(0,0.95fr)_auto_minmax(0,0.95fr)] sm:px-6">
            <div class="flex min-w-0 items-center gap-3">
              <div class="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-[var(--radio-surface-soft)] sm:h-14 sm:w-14"></div>
              <div class="min-w-0 flex-1 space-y-2">
                <div class="h-3 w-24 animate-pulse rounded-full bg-rose-500/20"></div>
                <div class="h-4 w-40 max-w-full animate-pulse rounded-full bg-[var(--radio-border-strong)]"></div>
                <div class="h-3 w-52 max-w-full animate-pulse rounded-full bg-[var(--radio-surface-soft)]"></div>
              </div>
            </div>
            <div class="ml-auto flex items-center justify-center gap-2 sm:ml-0">
              <div class="hidden h-9 w-9 animate-pulse rounded-full bg-[var(--radio-surface-soft)] sm:block"></div>
              <div class="h-12 w-12 animate-pulse rounded-full bg-rose-500/35"></div>
              <div class="hidden h-9 w-9 animate-pulse rounded-full bg-[var(--radio-surface-soft)] sm:block"></div>
            </div>
            <div class="hidden min-w-0 items-center justify-end gap-2 sm:flex">
              <div class="h-9 w-9 animate-pulse rounded-full bg-[var(--radio-surface-soft)]"></div>
              <div class="h-9 w-9 animate-pulse rounded-full bg-[var(--radio-surface-soft)]"></div>
              <div class="h-5 w-24 animate-pulse rounded-full bg-[var(--radio-surface-soft)]"></div>
            </div>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
  </UApp>
</template>

<script setup lang="ts">
import { en, vi, ja, zh_cn, zh_tw, fr, ru } from '@nuxt/ui/locale';
import { usePlaybackStore } from '~/stores/playback';
const playback = usePlaybackStore();
const clientReady = ref(false);
onMounted(() => { clientReady.value = true; });
const route = useRoute();
const config = useRuntimeConfig();
const noIndex = Boolean(config.public.noIndex);
const { locale } = useI18n();
const uiLocales = { en, vi, ja, 'zh-CN': zh_cn, 'zh-TW': zh_tw, fr, ru };
const uiLocale = computed(() => uiLocales[locale.value as keyof typeof uiLocales] || en);
const colorMode = useColorMode();

const siteUrl = computed(() => String(config.public.siteUrl).replace(/\/$/, ""));
const siteName = computed(() => String(config.public.siteName));
const defaultDescription = computed(() =>
  String(config.public.defaultDescription),
);
const canonicalUrl = computed(() => {
  const path = route.path === "/" ? "/" : route.path.replace(/\/$/, "");
  return `${siteUrl.value}${path}`;
});
const shareImage = computed(() => `${siteUrl.value}/brand/logo-share.png`);
const ogLocale = computed(
  () =>
    ({
      en: "en_US",
      vi: "vi_VN",
      ja: "ja_JP",
      "zh-CN": "zh_CN",
      "zh-TW": "zh_TW",
      fr: "fr_FR",
      ru: "ru_RU",
    })[locale.value] || "en_US",
);

useHead(() => ({
  htmlAttrs: {
    lang: locale.value,
  },
  link: noIndex ? [] : [
    {
      rel: "canonical",
      href: canonicalUrl.value,
    },
  ],
  script: noIndex ? [] : [
    {
      key: "website-schema",
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${siteUrl.value}/#website`,
        name: siteName.value,
        url: `${siteUrl.value}/`,
        description: defaultDescription.value,
        inLanguage: locale.value,
        publisher: {
          "@id": `${siteUrl.value}/#organization`,
        },
      }),
    },
    {
      key: "organization-schema",
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${siteUrl.value}/#organization`,
        name: siteName.value,
        url: `${siteUrl.value}/`,
        logo: {
          "@type": "ImageObject",
          url: shareImage.value,
        },
      }),
    },
  ],
}));

useSeoMeta(() => noIndex ? { robots: "noindex, nofollow, noarchive" } : ({
  description: defaultDescription.value,
  robots: "index, follow",
  ogType: "website",
  ogSiteName: siteName.value,
  ogLocale: ogLocale.value,
  ogTitle: siteName.value,
  ogDescription: defaultDescription.value,
  ogUrl: canonicalUrl.value,
  ogImage: shareImage.value,
  ogImageAlt: `${siteName.value} logo`,
  twitterCard: "summary_large_image",
  twitterTitle: siteName.value,
  twitterDescription: defaultDescription.value,
  twitterImage: shareImage.value,
  twitterImageAlt: `${siteName.value} logo`,
}));
</script>

