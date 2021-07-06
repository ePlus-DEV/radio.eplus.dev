export default {
  ssr: false,
  publicRuntimeConfig: {
    Base_URL: process.env.BASE_URL || "https://radio.eplus.dev",
    Site_Name: process.env.Site_Name || "Radio.ePlus.DEV",
    Facebook: process.env.Facebook || "https://www.facebook.com/hoangsvit",
    Fanpage: process.env.FanPage || "https://www.facebook.com/hoangsvit",
    Group_Facebook:
      process.env.Group_Facebook || "https://www.facebook.com/hoangsvit",
    Email_Contact:
      process.env.Group_Facebook || "https://www.facebook.com/hoangsvit",
    Pin_Channel_Favorites: process.env.Pin_Channel_Favorites || "viet-nam"
  },
  /*
   ** Headers of the page
   */
  metaInfo: {
    noscript: [{ innerHTML: "This website requires JavaScript." }]
  },
  head: {
    titleTemplate: "%sRadio Internet | " + process.env.Site_Name,
    htmlAttrs: {
      lang: "en",
      amp: false
    },
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
      {
        property: "og:image",
        content: process.env.BASE_URL + "brand/logo-share.png"
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
      { property: "og:audio:type", content: "audio/mpeg" }
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
  css: [
    "element-ui/lib/theme-chalk/index.css",
    "@/assets/custom/css/style.css"
  ],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: ["@/plugins/element-ui"],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [],
  /*
   ** Nuxt.js modules
   */
  modules: [
    "@nuxtjs/auth-next",
    "@nuxtjs/dotenv",
    "@nuxtjs/axios",
    "@nuxtjs/sitemap",
    [
      "nuxt-i18n",
      {
        locales: [
          {
            code: "en",
            file: "en-US.js",
            name: "English",
            flag: "/img/flags/europe/united-kingdom.png"
          },
          {
            code: "vi",
            file: "vi-VN.js",
            name: "Tiếng Việt",
            flag: "/img/flags/asia/viet-nam.png"
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
    transpile: [/^element-ui/],
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
  /*
   ** Auth Config
   */
  auth: {
    redirect: {
      login: "/admin/login",
      logout: "/",
      callback: "/admin/login",
      home: "/admin"
    },
    strategies: {
      local: false,
      auth0: {
        domain: "eplus-dev.auth0.com",
        clientId: "7I96ALVZfqpPKV7ebdcHFkYpXqY1Qf37"
        // audience: process.env.BASE_URL,
        // logoutRedirectUri: process.env.BASE_URL
      }
    }
  },
  proxy: {
    "/assets/": {
      target: process.env.BASE_URL,
      pathRewrite: { "^/assets/": "" },
      changeOrigin: true
    }
  },
  generate: {
    routes: [
      // Việt Nam
      "/viet-nam",
      "/viet-nam/vov1",
      "/viet-nam/vov2",
      "/viet-nam/vov3",
      "/viet-nam/vov4",
      "/viet-nam/vov5",
      "/viet-nam/vov-english",
      "/viet-nam/vov-gt-hcm",
      "/viet-nam/vov-giao-thong",
      "/viet-nam/voh-am-610khz",
      "/viet-nam/voh-fm-99.9-mhz",
      "/viet-nam/voh-fm-95.6-mhz",
      "/viet-nam/voh-fm-87.7-mhz",
      "/viet-nam/ba-ria-vung-tau",
      "/viet-nam/binh-phuoc",
      "/viet-nam/binh-thuan",
      "/viet-nam/ca-mau",
      "/viet-nam/can-tho",
      "/viet-nam/da-nang",
      "/viet-nam/ha-noi",
      "/viet-nam/ha-noi-joyfm",
      "/viet-nam/ha-noi-fm90",
      "/viet-nam/hai-duong",
      "/viet-nam/khanh-hoa",
      "/viet-nam/kien-giang",
      "/viet-nam/ninh-binh",
      "/viet-nam/soc-trang",
      "/viet-nam/thua-thien-hue",
      "/viet-nam/bac-giang",
      "/viet-nam/ha-tinh",
      "/viet-nam/phu-yen",
      "/viet-nam/tien-giang",
      "/viet-nam/ben-tre",
      "/viet-nam/dong-thap",
      "/viet-nam/gia-lai",
      "/viet-nam/thai-binh",
      "/viet-nam/vinh-long",
      "/viet-nam/xone-fm-96-mhz",
      "/viet-nam/dong-nai",
      "/viet-nam/nhk-vietnam",
      // United Kingdom
      "/united-kingdom",
      "/united-kingdom/heart-uk",
      "/united-kingdom/bbc-1",
      "/united-kingdom/bbc-2",
      "/united-kingdom/bbc-3",
      "/united-kingdom/bbc-4",
      "/united-kingdom/bbc-4-extra",
      "/united-kingdom/bbc-6",
      "/united-kingdom/capital-fm",
      "/united-kingdom/classic-rock",
      "/united-kingdom/jazz-fm",
      "/united-kingdom/bbc-asian",
      "/united-kingdom/classic-fm",
      "/united-kingdom/virgin",
      // Singapore
      "/singapore",
      "/singapore/love-972",
      "/singapore/class-95",
      "/singapore/987fm",
      "/singapore/capital-958",
      "/singapore/gold-90-5-fm",
      "/singapore/one-fm",
      "/singapore/oli",
      "/singapore/ria",
      "/singapore/kiss92",
      "/singapore/ufm-1003",
      "/singapore/warna",
      "/singapore/883-jia",
      "/singapore/symphony",
      "/singapore/cna938",
      "/singapore/power",
      "/singapore/masti-24x7",
      "/singapore/desi-dance",
      "/singapore/money-89-3",
      "/singapore/973fm",
      "/singapore/bible-witness-web",
      "/singapore/naga-fm",
      "/singapore/ccn-cyprus-chinese",
      "/singapore/melody-with-brother-bjorn",
      "/singapore/orion-station",
      "/singapore/96-3hao",
      // Australia
      "/australia",
      "/australia/radio-metro",
      "/australia/abc-news-radio",
      "/australia/774-abc-melbourne",
      "/australia/702-abc-sydney",
      // Documentation
      "/documentation"
    ]
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
  }
};
