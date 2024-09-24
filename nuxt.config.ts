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