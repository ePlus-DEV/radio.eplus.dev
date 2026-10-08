import type { ComputedRef, Ref } from "vue";

interface StaticPageSeoOptions {
  title: Ref<string> | ComputedRef<string>;
  description: Ref<string> | ComputedRef<string>;
  type?: "WebPage" | "AboutPage" | "ContactPage";
}

export const useStaticPageSeo = ({
  title,
  description,
  type = "WebPage",
}: StaticPageSeoOptions) => {
  const route = useRoute();
  const config = useRuntimeConfig();
  const siteUrl = computed(() =>
    String(config.public.siteUrl).replace(/\/$/, ""),
  );
  const canonicalUrl = computed(() => siteUrl.value + route.path);
  const shareImage = computed(
    () => siteUrl.value + "/brand/logo-share.png",
  );

  useHead(() => ({
    title: title.value,
    script: [
      {
        key: "static-page-schema:" + route.path,
        type: "application/ld+json",
        innerHTML: JSON.stringify({
          "@context": "https://schema.org",
          "@type": type,
          name: title.value,
          description: description.value,
          url: canonicalUrl.value,
          isPartOf: {
            "@id": siteUrl.value + "/#website",
          },
        }),
      },
    ],
  }));

  useSeoMeta(() => ({
    description: description.value,
    ogTitle: title.value,
    ogDescription: description.value,
    ogUrl: canonicalUrl.value,
    ogImage: shareImage.value,
    ogImageAlt: "Radio ePlus",
    twitterTitle: title.value,
    twitterDescription: description.value,
    twitterImage: shareImage.value,
    twitterImageAlt: "Radio ePlus",
  }));

  return { canonicalUrl };
};
