import { defineNuxtConfig } from "nuxt/config";
import { getRadioSeoRoutes, getSitemapEntry } from "./build/radioRoutes";

const algoliaApplicationId =
  process.env.NUXT_PUBLIC_ALGOLIA_APPLICATION_ID ||
  process.env.ALGOLIA_APPLICATION_ID ||
  "";
const algoliaApiKey =
  process.env.NUXT_PUBLIC_ALGOLIA_API_KEY ||
  process.env.ALGOLIA_API_KEY ||
  "";
const hasAlgoliaConfig = Boolean(algoliaApplicationId && algoliaApiKey);
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || "https://radio.eplus.dev").replace(
  /\/$/,
  "",
);
const siteName = process.env.NUXT_PUBLIC_SITE_NAME || "Radio ePlus";
const defaultDescription =
  process.env.DESCRIPTION ||
  "Listen to live internet radio stations from around the world on Radio ePlus.";
const radioSeoRoutes = getRadioSeoRoutes();

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  site: {
    url: siteUrl,
    name: siteName,
  },
  devtools: { enabled: process.env.NODE_ENV !== "production" },
  ssr: true,
  pages: true,
  runtimeConfig: {
    public: {
      cloudinaryBaseUrl: process.env.NUXT_PUBLIC_CLOUDINARY_BASE_URL,
      pinChannelFavorites: process.env.NUXT_PUBLIC_PIN_CHANNEL_FAVORITES,
      corsServer: process.env.NUXT_PUBLIC_CORS_SERVER_1,
      placeholder: "https://s3.eplus.dev/i/radio-on-air.png",
      placeholderStation: "https://s3.eplus.dev/i/station-on-air.png",
      apiZingLiveStreamProgramDetail:
        process.env.NUXT_PUBLIC_API_ZING_LIVE_STREAM_PROGRAM_DETAIL,
      apiZingGetLyric: process.env.NUXT_PUBLIC_API_ZING_GET_LYRIC,
      digitaloceanEndpoint: process.env.NUXT_PUBLIC_DIGITALOCEAN_ENDPOINT,
      digitaloceanApiKey: process.env.NUXT_PUBLIC_DIGITALOCEAN_API_KEY,
      x: process.env.NUXT_PUBLIC_X,
      facebook: process.env.NUXT_PUBLIC_FACEBOOK,
      github: process.env.NUXT_PUBLIC_GITHUB,
      copyright: process.env.NUXT_PUBLIC_COPYRIGHT,
      algoliaIndexStation: "radio.eplus.dev",
      algoliaIndexRadio: "world",
      algoliaConfigured: hasAlgoliaConfig,
      siteUrl,
      siteName,
      defaultDescription,
    },
  },
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@vesp/nuxt-fontawesome",
    "@nuxtjs/i18n",
    "@nuxt/image",
    "dayjs-nuxt",
    "@nuxtjs/sitemap",
    "@nuxtjs/algolia",
    "@pinia/nuxt",
  ],
  algolia: {
    // Always register the module so its composables are generated even when
    // deployment credentials are not available during the build phase.
    applicationId: algoliaApplicationId || "disabled",
    apiKey: algoliaApiKey || "disabled",
  },
  app: {
    head: {
      titleTemplate: `%s | ${siteName}`,
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: defaultDescription,
        },
        { name: "msapplication-TileColor", content: "#603cba" },
        { property: "article:author", content: process.env.FANPAGE },
        { property: "article:publisher", content: process.env.FANPAGE },
        { property: "fb:pages", content: "179495025583990" },
        { property: "fb:app_id", content: "363745774395676" },
      ],
      link: [
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/brand/apple-touch-icon.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/brand/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/brand/favicon-16x16.png",
        },
        { rel: "manifest", href: "/brand/site.webmanifest" },
        {
          rel: "mask-icon",
          color: "#5bbad5",
          href: "/brand/safari-pinned-tab.svg",
        },
      ],
    },
  },
  i18n: {
    restructureDir: false,
    locales: [
      {
        code: "en",
        file: "en-US.json",
        name: "English",
        flag: "/img/europe/flags/united-kingdom.png",
      },
      {
        code: "vi",
        file: "vi-VN.json",
        name: "Tiếng Việt",
        flag: "/img/asia/flags/viet-nam.png",
      },
      {
        code: "ja",
        file: "ja-JP.json",
        name: "日本語",
        flag: "/img/asia/flags/japan.png",
      },
      {
        code: "zh-CN",
        file: "zh-CN.json",
        name: "简体中文",
        flag: "/img/asia/flags/china.png",
      },
      {
        code: "zh-TW",
        file: "zh-TW.json",
        name: "繁體中文",
        flag: "/img/asia/flags/taiwan.png",
      },
      {
        code: "fr",
        file: "fr-FR.json",
        name: "Français",
        flag: "/img/europe/flags/france.png",
      },
      {
        code: "ru",
        file: "ru-RU.json",
        name: "Русский",
        flag: "/img/europe/flags/russia.png",
      },
    ],
    strategy: "no_prefix",
    lazy: true,
    langDir: "lang/",
    defaultLocale: "en",
  },
  fontawesome: {
    component: "fa",
    icons: {
      brands: ["facebook-f", "github", "x-twitter"],
    },
    proIcons: {
      solid: [
        "signal-stream",
        "xmark-large",
        "sun-bright",
        "moon",
        "desktop",
        "wifi-slash",
      ],
      regular: ["magnifying-glass-music", "house", "list-music"],
      light: ["sun-bright", "moon", "desktop", "bookmark", "up"],
      thin: [],
      duotone: ["snooze"],
    },
  },
  dayjs: {
    locales: ["vi", "ja", "zh-cn", "zh-tw", "fr", "ru"],
    plugins: ["relativeTime", "utc", "timezone", "localizedFormat"],
    defaultLocale: "en",
    defaultTimezone: "America/New_York",
  },
  image: {
    cloudinary: {
      baseURL: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/fetch/`,
    },
    provider: process.env.NODE_ENV === "production" ? "cloudinary" : "ipx",
  },
  colorMode: {
    preference: "system",
    fallback: "light",
    classPrefix: "",
    classSuffix: "",
    storageKey: "theme",
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        ...radioSeoRoutes.map((route) => route.loc),
        "/sitemap.xml",
      ],
    },
  },
  sitemap: {
    urls: radioSeoRoutes.map((route) => ({
      ...getSitemapEntry(route),
      loc: `${siteUrl}${route.loc}`,
    })),
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith("media-"),
    },
  },
});
