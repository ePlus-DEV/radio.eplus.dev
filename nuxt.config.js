import algoliasearch from "algoliasearch";
const world = require(`./static/assets/radio/world.json`);

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: "static",

  // Global page headers: https://go.nuxtjs.dev/config-head
  publicRuntimeConfig: {
    Base_URL:
      process.env.NODE_ENV === "production"
        ? process.env.BASE_URL
        : "http://localhost:3000",
    Site_Name: process.env.WEBSITE_NAME || "Radio.ePlus.DEV",
    Facebook: process.env.FACEBOOK,
    Instagram: process.env.INSTAGRAM,
    Github: process.env.GITHUB,
    Fanpage: process.env.FANPAGE,
    Copyright: process.env.COPYRIGHT,
    Blog: process.env.BLOG,
    Group_Facebook: process.env.GROUP_FACEBOOK,
    Email_Contact: process.env.GROUP_FACEBOOK,
    Pin_Channel_Favorites: process.env.PIN_CHANNEL_FAVORITES || "viet-nam",
    API_ZING_LIVE_STREAM_PROGRAM_DETAIL:
      process.env.API_ZING_LIVE_STREAM_PROGRAM_DETAIL,
    API_ZING_GET_LYRIC: process.env.API_ZING_GET_LYRIC,
    NETLIFY_BASE_URL: process.env.NETLIFY_BASE_URL,
    NETLIFY_TOKEN: process.env.NETLIFY_TOKEN,
    NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID,
    DIGITALOCEAN_ENDPOINT: process.env.DIGITALOCEAN_ENDPOINT,
    DIGITALOCEAN_API_KEY: process.env.DIGITALOCEAN_API_KEY,
    Area: [
      "africa",
      "asia",
      "europe",
      "north-america",
      "oceania",
      "central-america",
      "south-america",
    ],
    ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID,
    ALGOLIA_API_KEY: process.env.ALGOLIA_SEARCH_API_KEY,
    placeholder: "https://s3.eplus.dev/i/radio-on-air.png",
    placeholderStation: "https://s3.eplus.dev/i/station-on-air.png",
  },
  /*
   ** Headers of the page
   */
  metaInfo: {
    noscript: [{ innerHTML: "This website requires JavaScript." }],
  },
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
      { property: "fb:app_id", content: "363745774395676" },
    ],
    link: [
      {
        type: "apple-touch-icon",
        size: "180x180",
        href: "/brand/apple-touch-icon.png",
      },
      {
        rel: "icon",
        type: "image/x-icon",
        size: "32x32",
        href: "/brand/favicon-32x32.png",
      },
      {
        rel: "icon",
        type: "image/x-icon",
        size: "16x16",
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
    { src: "~/plugins/vue-instantsearch.js", ssr: false },
    { src: "~/plugins/moment.js" },
    { src: "~/plugins/v-calendar.js" },
    // { src: "~/plugins/let-it-snow.js" },
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    "@nuxt/image",
    "@nuxtjs/moment",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@nuxtjs/fontawesome",
  ],
  fontawesome: {
    component: "Fa",
    suffix: false,
    icons: {
      solid: true,
      brands: true,
    },
    proIcons: {
      solid: true,
      regular: true,
      light: true,
      thin: true,
      duotone: true,
    },
  },
  // momentjs
  moment: {
    timezone: true,
    defaultLocale: "en",
    locales: ["vi"],
  },
  /*
   ** Nuxt.js modules
   */
  modules: [
    "@nuxtjs/dotenv",
    "@nuxtjs/axios",
    "@nuxtjs/sitemap",
    "@nuxtjs/i18n",
    "@nuxtjs/cloudinary",
    [
      "nuxt-umami-module",
      {
        autoTrack: process.env.NODE_ENV === "production",
        doNotTrack: process.env.NODE_ENV !== "production",
        websiteId: "1ab44e9f-eb50-408c-a262-41f4595a916a",
        scriptUrl: "https://analytics.eplus.dev/umami.js",
      },
    ],
  ],
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {},
  },
  /*
   ** axios configuration
   */
  axios: {
    baseURL: process.env.BASE_URL,
    proxyHeaders: false,
    credentials: false,
    proxy: true,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  image: {
    cloudinary: {
      baseURL: `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/image/fetch/`,
    },
    provider: process.env.NODE_ENV === "production" ? "cloudinary" : "netlify",
  },
  content: {
    // Disable for security reason on CodeSandBox
    liveEdit: false,
  },
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
  proxy: {
    "/assets/": {
      target: process.env.BASE_URL,
      pathRewrite: { "^/assets/": "" },
      changeOrigin: true,
    },
  },
  generate: {
    async routes() {
      const client = algoliasearch(
        process.env.ALGOLIA_APP_ID,
        process.env.ALGOLIA_WRITE_API_KEY,
      );
      const station = client.initIndex("radio.eplus.dev");
      const theWorld = client.initIndex("world");

      const routesToGenerate = [];
      const dataStation = [];
      const dataWorld = [];

      await Promise.all([station.clearObjects(), theWorld.clearObjects()]);

      for (const [continentKey, continent] of Object.entries(world)) {
        const region = continentKey.replace(/_/g, "-");
        routesToGenerate.push(`/${region}`);

        for (const [countryKey, country] of Object.entries(continent)) {
          const countryData = require(`./static${country.data}`);

          routesToGenerate.push(`/${region}/${countryKey}`);

          dataWorld.push({
            name: country.name,
            category: continentKey,
            flag: `${process.env.BASE_URL}${country.flag}`,
            data: country.data,
            timezone: country.timezone,
            station_count: Object.keys(countryData).length,
            url: `/${region}/${countryKey}`,
            objectID: `${region}-${countryKey}`,
          });

          for (const [key, value] of Object.entries(countryData)) {
            routesToGenerate.push(`/${region}/${countryKey}/${key}`);

            dataStation.push({
              station_name: value.title,
              station_signal: value.signal,
              station_image: `${process.env.BASE_URL}${value.features}`,
              station_stream: value.stream,
              type: value.type,
              cros: value.cros,
              favorite: value.favorite || false,
              station_schedule: value.schedule,
              station_country: country.name,
              url: `/${region}/${countryKey}/${key}`,
              objectID: `${countryKey}-${key}`,
            });
          }
        }
      }

      await Promise.all([
        station.saveObjects(dataStation),
        theWorld.saveObjects(dataWorld),
      ]);

      return routesToGenerate;
    },
    fallback: "404.html",
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
      lastmodrealtime: true,
    },
  },
  // Darkmode
  colorMode: {
    classPrefix: "",
    classSuffix: "",
  },
};
