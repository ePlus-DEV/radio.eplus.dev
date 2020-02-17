export default {
  mode: 'spa',
  /*
  ** Headers of the page
  */
  metaInfo: {
    noscript: [
      {innerHTML: 'This website requires JavaScript.'}
    ]
  },
  head: {
    // title: process.env.npm_package_name || '',
    titleTemplate: '%sRadio Internet | Radio.ePlus.DEV',
    htmlAttrs: {
      lang: 'vi',
      amp: true
    },
    meta: [
      {charset: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {hid: 'description', name: 'description', content: process.env.npm_package_description || ''},
      {name: 'msapplication-TileColor', content: '#603cba'},
      {property: 'article:author', content: 'https://www.facebook.com/hoangsvit'},
      {property: 'article:publisher', content: 'https://www.facebook.com/hoangsvit'},
      {property: 'og:image', content: 'https://radio.eplus.dev/brand/logo-share.png'},
      {property: 'fb:pages', content: '179495025583990'},
      {property: 'fb:app_id', content: '363745774395676'},
      {property: 'og:title', content: 'Radio Internet | Radio.ePlus.DEV'},
      {property: 'og:description', content: process.env.npm_package_description || ''},
      {property: 'og:type', content: 'music.radio_station'},
      {property: 'og:url', content: 'https://radio.eplus.dev'},
      {property: 'og:image:alt', content: 'Radio Internet | Radio.ePlus.DEV'},
      {property: 'og:site_name', content: 'Radio Internet | Radio.ePlus.DEV'},
      {property: 'music:creator', content: 'https://www.facebook.com/hoangsvit'},
      {property: 'og:audio', content: 'https://media-ssl.musicradio.com/HeartUK'},
      {property: 'og:audio:type', content: 'audio/mpeg'},


    ],
    link: [
      {type: 'apple-touch-icon', size: '180x180', href: '/brand/apple-touch-icon.png'},
      {rel: 'icon', type: 'image/x-icon', size: '32x32', href: '/brand/favicon-32x32.png'},
      {rel: 'icon', type: 'image/x-icon', size: '16x16', href: '/brand/favicon-16x16.png'},
      {rel: 'manifest', href: '/brand/site.webmanifest'},
      {rel: 'mask-icon', color: '#5bbad5', href: '/brand/safari-pinned-tab.svg'},
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: {color: '#fff'},
  /*
  ** Global CSS
  */
  css: [
    'element-ui/lib/theme-chalk/index.css',
    '@/assets/custom/css/style.css'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/element-ui',
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [],
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/axios',
    '@nuxtjs/sitemap'
  ],
  /*
  ** Build configuration
  */
  build: {
    transpile: [/^element-ui/],
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
    }
  },
  /*
  ** axios configuration
  */
  axios: {
    baseURL: 'https://radio.eplus.dev',
    proxyHeaders: false,
    credentials: false,
    proxy: true
  },
  proxy: {
    '/assets/': {target: 'https://radio.eplus.dev/', pathRewrite: {'^/assets/': ''}, changeOrigin: true}
  },
  generate: {
    routes: [
      // Việt Nam
      '/viet-nam',
      '/viet-nam/vov1',
      '/viet-nam/vov2',
      '/viet-nam/vov3',
      '/viet-nam/vov4',
      '/viet-nam/vov5',
      '/viet-nam/vov-english',
      '/viet-nam/vov-gt-hcm',
      '/viet-nam/vov-giao-thong',
      '/viet-nam/voh-am-610khz',
      '/viet-nam/voh-fm-99.9-mhz',
      '/viet-nam/voh-fm-95.6-mhz',
      '/viet-nam/voh-fm-87.7-mhz',
      '/viet-nam/ba-ria-vung-tau',
      '/viet-nam/binh-phuoc',
      '/viet-nam/binh-thuan',
      '/viet-nam/ca-mau',
      '/viet-nam/can-tho',
      '/viet-nam/da-nang',
      '/viet-nam/ha-noi',
      '/viet-nam/ha-noi-joyfm',
      '/viet-nam/ha-noi-fm90',
      '/viet-nam/hai-duong',
      '/viet-nam/khanh-hoa',
      '/viet-nam/kien-giang',
      '/viet-nam/ninh-binh',
      '/viet-nam/soc-trang',
      '/viet-nam/thua-thien-hue',
      '/viet-nam/bac-giang',
      '/viet-nam/ha-tinh',
      '/viet-nam/phu-yen',
      '/viet-nam/tien-giang',
      '/viet-nam/ben-tre',
      '/viet-nam/dong-thap',
      '/viet-nam/gia-lai',
      '/viet-nam/thai-binh',
      '/viet-nam/vinh-long',
      '/viet-nam/xone-fm-96-mhz',
      '/viet-nam/dong-nai',
      // United Kingdom
      '/united-kingdom',
      '/united-kingdom/heart-uk',
      '/united-kingdom/bbc-1',
      '/united-kingdom/bbc-2',
      '/united-kingdom/bbc-3',
      '/united-kingdom/bbc-4',
      '/united-kingdom/bbc-4-extra',
      '/united-kingdom/bbc-6',
      '/united-kingdom/capital-fm',
      '/united-kingdom/classic-rock',
      '/united-kingdom/jazz-fm',
      '/united-kingdom/bbc-asian',
      '/united-kingdom/classic-fm',
      '/united-kingdom/virgin',
      // Singapore
      '/singapore',
      '/singapore/love-972',
      '/singapore/class-95',
      '/singapore/987fm',
      '/singapore/987fm',
      // Australia
      '/australia',
      '/australia/radio-metro',
      '/australia/abc-news-radio',
      '/australia/774-abc-melbourne',
      '/australia/702-abc-sydney'
    ]
  },
  /* SiteMap */
  sitemap: {
    path: '/sitemap.xml',
    hostname: 'https://radio.eplus.dev',
    gzip: true,
    exclude: [
      '/secret',
      '/admin/**'
    ],
    defaults: {
      changefreq: 'daily',
      priority: 1,
      lastmod: new Date(),
      lastmodrealtime: true
    },
    /*routes: [
      '/page/1',
      {
        url: '/page/2',
        changefreq: 'daily',
        priority: 1,
        lastmodISO: '2017-06-30T13:30:00.000Z'
      }
    ]*/
  }
}
