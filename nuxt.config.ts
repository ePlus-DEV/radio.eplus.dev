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
  i18n: {
    locales: [
      {
        code: "en",
        file: "en-US.json",
        iso: "en-US",
        name: "English",
        flag: "/img/europe/flags/united-kingdom.png",
      },
      {
        code: "vi",
        file: "vi-VN.json",
        iso: "vi-VN",
        name: "Tiếng Việt",
        flag: "/img/asia/flags/viet-nam.png",
      },
      {
        code: "ja",
        file: "ja-JP.json",
        iso: "ja-JP",
        name: "日本語",
        flag: "/img/asia/flags/japan.png",
      },
      {
        code: "cn",
        file: "zh-CN.json",
        iso: "zh-CN",
        name: "简体中文",
        flag: "/img/asia/flags/china.png",
      },
      {
        code: "tw",
        file: "zh-TW.json",
        iso: "zh-TW",
        name: "繁體中文",
        flag: "/img/asia/flags/taiwan.png",
      },
      {
        code: "fr",
        file: "fr-FR.json",
        iso: "fr-FR",
        name: "Français",
        flag: "/img/europe/flags/france.png",
      },
      {
        code: "ru",
        file: "ru-RU.json",
        iso: "ru-RU",
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
