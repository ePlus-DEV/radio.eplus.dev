import algoliasearch from "algoliasearch";
// Asia
import vietnam from "./static/assets/radio/asia/viet-nam.json";
import korea from "./static/assets/radio/asia/korea.json";
import china from "./static/assets/radio/asia/china.json";
import singapore from "./static/assets/radio/asia/singapore.json";
import hong_kong from "./static/assets/radio/asia/hong-kong.json";
import japan from "./static/assets/radio/asia/japan.json";
import malaysia from "./static/assets/radio/asia/malaysia.json";
import philippines from "./static/assets/radio/asia/philippines.json";
import indonesia from "./static/assets/radio/asia/indonesia.json";
import thailand from "./static/assets/radio/asia/thailand.json";
// Europe
import uk from "./static/assets/radio/europe/united-kingdom.json";
import ukraine from "./static/assets/radio/europe/ukraine.json";
import russia from "./static/assets/radio/europe/russia.json";
// North America
import cuba from "./static/assets/radio/north-america/cuba.json";
import haiti from "./static/assets/radio/north-america/haiti.json";
import jamaica from "./static/assets/radio/north-america/jamaica.json";
import mexico from "./static/assets/radio/north-america/mexico.json";
import puerto_rico from "./static/assets/radio/north-america/puerto-rico.json";
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
    // "@nuxt/content",
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
      const client = algoliasearch(
        "N87NFQVY0Z",
        "73e93ee2ef3aa6919b7c6495767c7f9d"
      );
      const index = client.initIndex("radio.eplus.dev");
      const routesToGenerate = [],
        data_algolia = [];
      // BEGIN - Asia
      for (const [key, value] of Object.entries(vietnam)) {
        routesToGenerate.push("/viet-nam/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.asia.vietnam",
          url: "/viet-nam/" + key,
          objectID: "viet-nam-" + key
        });
      }
      for (const [key, value] of Object.entries(korea)) {
        routesToGenerate.push("/korea/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.asia.korea",
          url: "/korea/" + key,
          objectID: "korea-" + key
        });
      }
      for (const [key, value] of Object.entries(singapore)) {
        routesToGenerate.push("/singapore/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.asia.singapore",
          url: "/singapore/" + key,
          objectID: "singapore-" + key
        });
      }
      for (const [key, value] of Object.entries(china)) {
        routesToGenerate.push("/china/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.asia.china",
          url: "/china/" + key,
          objectID: "china-" + key
        });
      }
      for (const [key, value] of Object.entries(hong_kong)) {
        routesToGenerate.push("/hong-kong/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.asia.hong_kong",
          url: "/hong-kong/" + key,
          objectID: "hong-kong-" + key
        });
      }
      for (const [key, value] of Object.entries(japan)) {
        routesToGenerate.push("/japan/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.asia.japan",
          url: "/japan/" + key,
          objectID: "japan-" + key
        });
      }
      for (const [key, value] of Object.entries(malaysia)) {
        routesToGenerate.push("/malaysia/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.asia.malaysia",
          url: "/malaysia/" + key,
          objectID: "malaysia-" + key
        });
      }
      for (const [key, value] of Object.entries(philippines)) {
        routesToGenerate.push("/philippines/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.asia.philippines",
          url: "/philippines/" + key,
          objectID: "philippines-" + key
        });
      }
      for (const [key, value] of Object.entries(indonesia)) {
        routesToGenerate.push("/indonesia/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.asia.indonesia",
          url: "/indonesia/" + key,
          objectID: "indonesia-" + key
        });
      }
      for (const [key, value] of Object.entries(thailand)) {
        routesToGenerate.push("/thailand/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.asia.thailand",
          url: "/thailand/" + key,
          objectID: "thailand-" + key
        });
      }
      // END - Asia
      // BEGIN - Europe
      for (const [key, value] of Object.entries(uk)) {
        routesToGenerate.push("/united-kingdom/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.europe.united_kingdom",
          url: "/united-kingdom/" + key,
          objectID: "united-kingdom-" + key
        });
      }
      for (const [key, value] of Object.entries(ukraine)) {
        routesToGenerate.push("/ukraine/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.europe.ukraine",
          url: "/ukraine/" + key,
          objectID: "ukraine-" + key
        });
      }
      for (const [key, value] of Object.entries(russia)) {
        routesToGenerate.push("/russia/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.europe.russia",
          url: "/russia/" + key,
          objectID: "russia-" + key
        });
      }
      // END - Europe
      // BEGIN - North America
      for (const [key, value] of Object.entries(cuba)) {
        routesToGenerate.push("/cuba/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.north_america.cuba",
          url: "/cuba/" + key,
          objectID: "cuba-" + key
        });
      }
      for (const [key, value] of Object.entries(haiti)) {
        routesToGenerate.push("/haiti/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.north_america.haiti",
          url: "/haiti/" + key,
          objectID: "haiti-" + key
        });
      }
      for (const [key, value] of Object.entries(jamaica)) {
        routesToGenerate.push("/jamaica/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.north_america.jamaica",
          url: "/jamaica/" + key,
          objectID: "jamaica-" + key
        });
      }
      for (const [key, value] of Object.entries(mexico)) {
        routesToGenerate.push("/mexico/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.north_america.mexico",
          url: "/mexico/" + key,
          objectID: "mexico-" + key
        });
      }
      for (const [key, value] of Object.entries(puerto_rico)) {
        routesToGenerate.push("/puerto-rico/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.north_america.puerto_rico",
          url: "/puerto-rico/" + key,
          objectID: "puerto-rico-" + key
        });
      }
      // END - North America
      // BEGIN - Oceania
      for (const [key, value] of Object.entries(australia)) {
        routesToGenerate.push("/australia/" + key);
        data_algolia.push({
          station_name: value.title,
          station_image: process.env.BASE_URL + value.features,
          station_country: "world.oceania.australia",
          url: "/australia/" + key,
          objectID: "australia-" + key
        });
      }
      // END - Oceania
      index.saveObjects(data_algolia).then(({ objectIDs }) => {});
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
