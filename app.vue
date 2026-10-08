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
        <div class="radio-player-dock fixed inset-x-0 bottom-0 z-[60] border-t border-[var(--radio-border)] bg-[var(--radio-surface-elevated)]"></div>
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

