<template>
  <div class="min-h-screen w-full overflow-x-hidden">
    <AppHeader />
    <main class="mx-auto mt-20 w-full max-w-7xl min-w-0 px-3 sm:px-4" scroll-container>
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();
const { locale } = useI18n();

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
        name: siteName.value,
        url: `${siteUrl.value}/`,
        description: defaultDescription.value,
        inLanguage: locale.value,
      }),
    },
  ],
}));

useSeoMeta(() => ({
  description: defaultDescription.value,
  robots: "index, follow",
  ogType: "website",
  ogSiteName: siteName.value,
  ogTitle: siteName.value,
  ogDescription: defaultDescription.value,
  ogUrl: canonicalUrl.value,
  ogImage: shareImage.value,
  twitterCard: "summary_large_image",
  twitterTitle: siteName.value,
  twitterDescription: defaultDescription.value,
  twitterImage: shareImage.value,
}));
</script>
