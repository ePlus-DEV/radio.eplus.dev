// Asia
import vietnam from "./static/assets/radio/asia/viet-nam.json";
import korea from "./static/assets/radio/asia/korea.json";
import china from "./static/assets/radio/asia/china.json";
import singapore from "./static/assets/radio/asia/singapore.json";
// Europe
import uk from "./static/assets/radio/europe/united-kingdom.json";
// North America
import cuba from "./static/assets/radio/north-america/cuba.json";
// Oceania
import australia from "./static/assets/radio/oceania/australia.json";

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: "static",

  // Global page headers: https://go.nuxtjs.dev/config-head
  publicRuntimeConfig: {
    Base_URL: process.env.BASE_URL || "https://radio.eplus.dev",
    Site_Name: process.env.Site_Name || "Radio.ePlus.DEV",
    Facebook: process.env.Facebook,
    Instagram: process.env.Instagram,
    Github: process.env.Github,
    Fanpage: process.env.FanPage,
    Copyright: process.env.Copyright,
    Blog: process.env.Blog,
    Group_Facebook: process.env.Group_Facebook,
    Email_Contact: process.env.Group_Facebook,
    Pin_Channel_Favorites: process.env.Pin_Channel_Favorites || "viet-nam"
  },
  /*
   ** Headers of the page
   */
  metaInfo: {
    noscript: [{ innerHTML: "This website requires JavaScript." }]
  },
  head: {
    titleTemplate: "%s - Radio Internet | " + process.env.Site_Name,
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: process.env.Description || ""
      },
      { name: "msapplication-TileColor", content: "#603cba" },
      {
        property: "article:author",
        content: process.env.FanPage
      },
      {
        property: "article:publisher",
        content: process.env.FanPage
      },
      { property: "fb:pages", content: "179495025583990" },
      { property: "fb:app_id", content: "363745774395676" }
      /* {
        property: "og:image",
        content: process.env.BASE_URL + "/brand/logo-share.png"
      },
      { property: "fb:pages", content: "179495025583990" },
      { property: "fb:app_id", content: "363745774395676" },
      {
        property: "og:title",
        content: "Radio Internet | " + process.env.Site_Name
      },
      {
        property: "og:description",
        content: process.env.Description || ""
      },
      { property: "og:type", content: "music.radio_station" },
      { property: "og:url", content: process.env.BASE_URL },
      {
        property: "og:image:alt",
        content: "Radio Internet | " + process.env.Site_Name
      },
      {
        property: "og:site_name",
        content: "Radio Internet | " + process.env.Site_Name
      },
      {
        property: "music:creator",
        content: process.env.FanPage
      },
      {
        property: "og:audio",
        content: "https://media-ssl.musicradio.com/HeartUK"
      },
      { property: "og:audio:type", content: "audio/mpeg" },
      { property: "application-name", content: process.env.Site_Name } */
    ],
    link: [
      {
        type: "apple-touch-icon",
        size: "180x180",
        href: "/brand/apple-touch-icon.png"
      },
      {
        rel: "icon",
        type: "image/x-icon",
        size: "32x32",
        href: "/brand/favicon-32x32.png"
      },
      {
        rel: "icon",
        type: "image/x-icon",
        size: "16x16",
        href: "/brand/favicon-16x16.png"
      },
      {
        rel: "manifest",
        href: "/brand/site.webmanifest"
      },
      {
        rel: "mask-icon",
        color: "#5bbad5",
        href: "/brand/safari-pinned-tab.svg"
      }
    ]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#fff" },
  /*
   ** Global CSS
   */
  css: ["@/assets/custom/css/style.css"],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    { src: "~/plugins/plyr.js", ssr: false },
    { src: "~plugins/scrollmagic.js", ssr: false },
    { src: "~/plugins/vue-toastification.js", ssr: false },
    { src: "~/plugins/vue-instantsearch.js", ssr: false }
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    "@nuxtjs/moment",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@nuxtjs/google-analytics"
  ],
  // GA
  googleAnalytics: {
    id: "UA-129271342-9",
    debug: {
      enabled: process.env.NODE_ENV === "production"
    }
  },
  // momentjs
  moment: {
    timezone: true,
    defaultLocale: "en",
    locales: ["vi"]
  },
  /*
   ** Nuxt.js modules
   */
  modules: [
    // "@nuxtjs/recaptcha",
    // "@nuxtjs/auth-next",
    "@nuxtjs/dotenv",
    "@nuxtjs/axios",
    "@nuxt/content",
    "@nuxtjs/sitemap",
    [
      "nuxt-i18n",
      {
        locales: [
          {
            code: "en",
            file: "en-US.js",
            name: "English",
            flag: "/img/europe/flags/united-kingdom.png"
          },
          {
            code: "vi",
            file: "vi-VN.js",
            name: "Tiếng Việt",
            flag: "/img/asia/flags/viet-nam.png"
          }
        ],
        strategy: "no_prefix",
        lazy: true,
        langDir: "lang/",
        defaultLocale: "en"
      }
    ]
  ],
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {}
  },
  /*
   ** axios configuration
   */
  axios: {
    baseURL: process.env.BASE_URL,
    proxyHeaders: false,
    credentials: false,
    proxy: true
  },

  proxy: {
    "/assets/": {
      target: process.env.BASE_URL,
      pathRewrite: { "^/assets/": "" },
      changeOrigin: true
    }
  },
  generate: {
    routes() {
      const routesToGenerate = [];
      // BEGIN - Asia
      for (const [key, value] of Object.entries(vietnam)) {
        routesToGenerate.push("/viet-nam/" + key);
      }
      for (const [key, value] of Object.entries(korea)) {
        routesToGenerate.push("/korea/" + key);
      }
      for (const [key, value] of Object.entries(singapore)) {
        routesToGenerate.push("/singapore/" + key);
      }
      for (const [key, value] of Object.entries(china)) {
        routesToGenerate.push("/china/" + key);
      }
      // END - Asia
      // BEGIN - Europe
      for (const [key, value] of Object.entries(uk)) {
        routesToGenerate.push("/united-kingdom/" + key);
      }
      // END - Europe
      // BEGIN - North America
      for (const [key, value] of Object.entries(cuba)) {
        routesToGenerate.push("/cuba/" + key);
      }
      // END - North America
      // BEGIN - Oceania
      for (const [key, value] of Object.entries(australia)) {
        routesToGenerate.push("/australia/" + key);
      }
      // END - Oceania
      return routesToGenerate;
    }
  },
  /* SiteMap */
  sitemap: {
    path: "/sitemap.xml",
    hostname: process.env.BASE_URL,
    gzip: true,
    exclude: ["/secret", "/admin/**"],
    defaults: {
      changefreq: "daily",
      priority: 1,
      lastmod: new Date(),
      lastmodrealtime: true
    }
  },
  // Darkmode
  colorMode: {
    classPrefix: "",
    classSuffix: ""
  }
};
