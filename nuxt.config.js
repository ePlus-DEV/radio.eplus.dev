import algoliasearch from "algoliasearch";
// Define the regions and their corresponding JSON files
const regions = [
  { region: "africa", files: ["algeria", "nigeria"] },
  { region: "asia", files: ["viet-nam", "korea", "china", "singapore", "hong-kong", "japan", "malaysia", "philippines", "indonesia", "thailand", "bangladesh", "pakistan", "india", "taiwan", "israel", "sri-lanka", "nepal"] },
  { region: "central-america", files: ["costa-rica", "el-salvador", "guatemala", "honduras", "nicaragua"] },
  { region: "europe", files: ["united-kingdom", "ukraine", "russia"] },
  { region: "north-america", files: ["cuba", "haiti", "jamaica", "mexico", "puerto-rico", "dominican-republic", "trinidad-and-tobago"] },
  { region: "oceania", files: ["australia", "new-zealand"] }
];

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
    Site_Name: process.env.Site_Name || "Radio.ePlus.DEV",
    Facebook: process.env.Facebook,
    Instagram: process.env.Instagram,
    Github: process.env.Github,
    Fanpage: process.env.FanPage,
    Copyright: process.env.Copyright,
    Blog: process.env.Blog,
    Group_Facebook: process.env.Group_Facebook,
    Email_Contact: process.env.Group_Facebook,
    Pin_Channel_Favorites: process.env.Pin_Channel_Favorites || "viet-nam",
    API_ZING_LIVE_STREAM_PROGRAM_DETAIL:
      process.env.API_ZING_LIVE_STREAM_PROGRAM_DETAIL,
    API_ZING_GET_LYRIC: process.env.API_ZING_GET_LYRIC,
    NETLIFY_BASE_URL: process.env.NETLIFY_BASE_URL,
    NETLIFY_TOKEN: process.env.NETLIFY_TOKEN,
    NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID,
  },
  /*
   ** Headers of the page
   */
  metaInfo: {
    noscript: [{ innerHTML: "This website requires JavaScript." }],
  },
  head: {
    titleTemplate: "%s - Radio Internet | " + process.env.Site_Name,
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: process.env.Description || "",
      },
      { name: "msapplication-TileColor", content: "#603cba" },
      {
        property: "article:author",
        content: process.env.FanPage,
      },
      {
        property: "article:publisher",
        content: process.env.FanPage,
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
    "@nuxtjs/moment",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/color-mode",
    "@nuxtjs/google-analytics",
  ],
  // GA
  googleAnalytics: {
    id: "UA-129271342-9",
    debug: {
      enabled: process.env.NODE_ENV === "production",
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
    "@nuxt/image",
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
      baseURL:
        "https://res.cloudinary.com/" +
        process.env.CLOUDINARY_NAME +
        "/image/fetch/",
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
        file: "en-US.js",
        iso: "en-US",
        name: "English",
        flag: "/img/europe/flags/united-kingdom.png",
      },
      {
        code: "vi",
        file: "vi-VN.js",
        iso: "vi-VN",
        name: "Tiếng Việt",
        flag: "/img/asia/flags/viet-nam.png",
      },
      {
        code: "ja",
        file: "ja-JP.js",
        iso: "ja-JP",
        name: "日本語",
        flag: "/img/asia/flags/japan.png",
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
    routes() {
      const client = algoliasearch("N87NFQVY0Z", "73e93ee2ef3aa6919b7c6495767c7f9d");
      const index = client.initIndex("radio.eplus.dev");
      const routesToGenerate = [];
      const data_algolia = [];

      regions.forEach(({ region, files }) => {
        files.forEach((file) => {
          const jsonData = require(`./static/assets/radio/${region}/${file}.json`);
          const countryCode = file.replace("-", ".");

          for (const [key, value] of Object.entries(jsonData)) {
            routesToGenerate.push(`/${file}/${key}`);
            data_algolia.push({
              station_name: value.title,
              station_image: process.env.BASE_URL + value.features,
              station_country: `world.${region}.${countryCode}`,
              url: `/${file}/${key}`,
              objectID: `${file}-${key}`,
            });
          }
        });
      });
      // END - Oceania
      index.saveObjects(data_algolia).then(({ objectIDs }) => {});
      return routesToGenerate;
    },
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
