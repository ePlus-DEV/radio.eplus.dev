<template>
  <div class="min-h-screen w-full overflow-x-hidden bg-[var(--radio-page-bg)] text-[var(--radio-text)] transition-colors">
    <AppHeader />
    <div class="mx-auto w-full max-w-[1660px] xl:grid xl:grid-cols-[248px_minmax(0,1fr)] xl:gap-7 xl:px-6">
      <AppSidebar />
      <main
        class="mx-auto w-full min-w-0 max-w-7xl px-4 pb-14 pt-24 sm:px-6 sm:pt-28 xl:px-0"
        id="main-content"
        scroll-container
      >
        <NuxtPage />
      </main>
    </div>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();
const { locale } = useI18n();
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
  link: [
    {
      rel: "canonical",
      href: canonicalUrl.value,
    },
  ],
  script: [
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

useSeoMeta(() => ({
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
