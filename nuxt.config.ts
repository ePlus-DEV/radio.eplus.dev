import { defineNuxtConfig } from "nuxt/config";
import { vite as vidstack } from "vidstack/plugins";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  ssr: false,
  pages: true,
  modules: [
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@vesp/nuxt-fontawesome",
    "@nuxtjs/i18n",
  ],
  app: {
    head: {
      titleTemplate: `%s - Radio Internet | ${process.env.WEBSITE_NAME}`,
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          hid: "description",
          name: "description",
          content: process.env.DESCRIPTION || "",
        },
        { name: "msapplication-TileColor", content: "#603cba" },
        {
          property: "article:author",
          content: process.env.FANPAGE,
        },
        {
          property: "article:publisher",
          content: process.env.FANPAGE,
        },
        { property: "fb:pages", content: "179495025583990" },
        { property: "fb:app_id", content: "363745774395676" }
      ],
      link: [
        {
          type: "apple-touch-icon",
          sizes: "180x180",
          href: "/brand/apple-touch-icon.png",
        },
        {
          rel: "icon",
          type: "image/x-icon",
          sizes: "32x32",
          href: "/brand/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/x-icon",
          sizes: "16x16",
          href: "/brand/favicon-16x16.png",
        },
        {
          rel: "manifest",
          href: "/brand/site.webmanifest",
        },
        {
          rel: "mask-icon",
          color: "#5bbad5",
          href: "/brand/safari-pinned-tab.svg",
        },
      ],
    }
  },
  i18n: {
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
        code: "cn",
        file: "zh-CN.json",
        name: "简体中文",
        flag: "/img/asia/flags/china.png",
      },
      {
        code: "tw",
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
    // component: "fa",
    // suffix: true,
    icons: {
      solid: ["dollar-sign", "cog", "circle", "check", "calendar"],
      regular: ["user"],
    },
    proIcons: {
      solid: ["bell-plus", "music-magnifying-glass"],
      regular: [],
      light: [],
      thin: [],
      duotone: [],
    },
  },
  vite: {
    plugins: [vidstack()],
  },
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith("media-"),
    },
  },
});
