<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Features</span>
      </div>
      <ul>
        <li>
          Build your next Vue.js application with confidence using NuxtJS. An open source
          framework making web development simple and powerful.
        </li>
        <li>
          Element, a Vue 2.0 based component library for developers, designers and product
          managers
        </li>
        <li>Code Splitting, Lazy loading</li>
        <li>Fully Responsive Layout</li>
        <li>Organized Folder Structure</li>
        <li>Clean & Commented Code</li>
        <li>Multi-lingual Support</li>
        <li>Well Documented</li>
        <li>FREE Lifetime Updates</li>
        <li>6 months of free support included</li>
      </ul>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Technical Specification</span>
      </div>
      <ul>
        <li>
          Powered by
          <el-link type="primary" href="https://nuxtjs.org/" target="_blank"
            >NuxtJS</el-link
          >
        </li>
        <li>
          Secure and easy
          <el-link type="primary" href="https://axios.nuxtjs.org/" target="_blank"
            >Axios
          </el-link>
          integration for Nuxt.
        </li>
        <li>
          <el-link type="primary" href="https://sitemap.nuxtjs.org/" target="_blank"
            >@nuxtjs/sitemap</el-link
          >
          - Automatically generate or serve dynamic <mark>sitemap.xml</mark> for Nuxt
          projects!
        </li>
        <li>
          <el-link type="primary" href="https://element.eleme.io/#/en-US" target="_blank"
            >Element</el-link
          >, a Vue 2.0 based component library for developers, designers and product
          managers
        </li>
        <li>
          <el-link type="primary" href="https://www.mediaelementjs.com/" target="_blank"
            >MediaElement.js
          </el-link>
          - A dependable HTML media framework
        </li>
        <li>
          <el-link type="primary" href="https://i18n.nuxtjs.org/" target="_blank"
            >@nuxt-i18n</el-link
          >
          - is internationalization plugin for NuxtJS
        </li>
        <li>
          <el-link
            type="primary"
            href="https://www.npmjs.com/package/@nuxtjs/dotenv"
            target="_blank"
            >@nuxtjs/dotenv</el-link
          >
          - A nuxt.js module that loads your .env file into your context options
        </li>
      </ul>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Folder Structure</span>
      </div>
      <el-input placeholder="Filter keyword" v-model="filterText"> </el-input>
      <el-tree
        class="filter-tree"
        :data="data"
        :props="defaultProps"
        :filter-node-method="filterNode"
        ref="tree"
      >
      </el-tree>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Installation</span>
      </div>
      <p>
        First of all make sure you have installed
        <el-link type="danger" href="https://nodejs.org/en/" target="_blank"
          >Node</el-link
        >
        and
        <el-link type="danger" href="https://www.npmjs.com/" target="_blank">NPM</el-link
        >/<el-link type="danger" href="https://yarnpkg.com/" target="_blank">YARN</el-link
        >.
      </p>
      <pre><code class="language-bash">npm install</code></pre>
      <p>Now to run development server, run below command:</p>
      <pre><code class="language-bash">npm run dev</code></pre>
      <p>
        Now you will find some output after running above command in console as below:
      </p>
      <pre><code class="language-bash">> radio@1.0.0 dev D:\FC-Server\localhost\radio
> nuxt

i [HPM] Proxy created: /assets/  -> https://radio.eplus.dev                                  10:17:02
i [HPM] Proxy rewrite rule created: "^/assets/" ~> ""                                        10:17:02

   ╭───────────────────────────────────────╮
   │                                       │
   │   Nuxt @ v2.15.7                      │
   │                                       │
   │   ▸ Environment: development          │
   │   ▸ Rendering:   client-side          │
   │   ▸ Target:      server               │
   │                                       │
   │   Listening: http://localhost:3000/   │
   │                                       │
   ╰───────────────────────────────────────╯

i Preparing project for development                                                          10:17:04
i Initial build may take a while                                                             10:17:04
√ Builder initialized                                                                        10:17:04
√ Nuxt files generated                                                                       10:17:04

√ Client
  Compiled successfully in 4.70s

i Waiting for file changes                                                                   10:17:10
i Memory usage: 263 MB (RSS: 357 MB)                                                         10:17:10
i Listening on: http://localhost:3000/ </code></pre>
      <p>
        Visit
        <el-link type="danger" href="http://localhost:3030/" target="_blank"
          >http://localhost:3030/</el-link
        >
        to check frontend.
      </p>
    </el-card>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Config</span>
      </div>

      <h3>Environment</h3>
      <p>
        Change template to fit your needs. To configure template we will use
        <mark>.env</mark> & <mark>nuxt.config.js</mark> file, which have all template
        configurations listed with their valid values.
      </p>
      <pre><code class="language-bash">BASE_URL=https://radio.eplus.dev
Site_Name="Radio.ePlus.DEV"
Description="Radio Online Việt Nam, Singapore, Indonesia, Malaysia, Philippines, Pakistan, Hong Kong, ประเทศไทย, 中国, 台灣, Australia, New Zealand, Sri Lankā, Nepāla, United Kingdom, .v.v"
FanPage=https://www.facebook.com/hoangsvit
Facebook=https://www.facebook.com/hoangsvit
Group_Facebook=https://www.facebook.com/groups/radio.eplus.dev
Email_Contact="admin@eplus.dev"
## Pin_Channel_Favorites: viet-nam | singapore | united-kingdom | australia
Pin_Channel_Favorites="viet-nam"</code></pre>
    </el-card>
  </div>
</template>
<script>
export default {
  head() {
    return {
      title: "Documentation -  Radio " + this.title_slug + " - ",
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Documentation",
        },
      ],
      link: [
        {
          rel: "stylesheet",
          href: "/assets/css/prism.css",
        },
      ],
      script: [
        {
          type: "text/javascript",
          src: "assets/js/prism.js",
          body: true,
        },
      ],
    };
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
  },
  data() {
    return {
      filterText: "",
      data: [
        {
          id: 1,
          label: "assets",
          children: [
            {
              id: 4,
              label: "custom",
              children: [
                {
                  id: 9,
                  label: "js",
                  children: [
                    {
                      id: 9,
                      label: "player.js",
                    },
                  ],
                },
                {
                  id: 10,
                  label: "css",
                  children: [
                    {
                      id: 9,
                      label: "style.css",
                    },
                  ],
                },
              ],
            },
            {
              id: 10,
              label: "README.md",
            },
          ],
        },
        {
          id: 2,
          label: "components",
          children: [
            {
              id: 1,
              label: "Footer.vue",
            },
            {
              id: 2,
              label: "Header.vue",
            },
            {
              id: 3,
              label: "NavBar.vue",
            },
            {
              id: 4,
              label: "PanelAustralia.vue",
            },
            {
              id: 5,
              label: "PanelRadio.vue",
            },
            {
              id: 6,
              label: "PanelSingapore.vue",
            },
            {
              id: 7,
              label: "PanelUnitedKingdom.vue",
            },
            {
              id: 8,
              label: "PanelVietNam.vue",
            },
            {
              id: 9,
              label: "Player.vue",
            },
            {
              id: 10,
              label: "README.md",
            },
          ],
        },
        {
          id: 3,
          label: "lang",
          children: [
            {
              id: 7,
              label: "en-US.js",
            },
            {
              id: 8,
              label: "vi-VN.js",
            },
          ],
        },
        {
          id: 4,
          label: "layouts",
          children: [
            {
              id: 7,
              label: "default.vue",
            },
            {
              id: 8,
              label: "README.md",
            },
          ],
        },
        {
          id: 5,
          label: "middleware",
          children: [
            {
              id: 7,
              label: "README.md",
            },
          ],
        },
        {
          id: 6,
          label: "node_modules (After installation)",
          children: [
            {
              id: 7,
              label: "@nuxtjs",
            },
            {
              id: 8,
              label: "axios",
            },
            {
              id: 9,
              label: "......",
            },
          ],
        },
        {
          id: 7,
          label: "pages",
          children: [
            {
              id: 1,
              label: "australia",
              children: [
                {
                  id: 9,
                  label: "_name.vue",
                },
                {
                  id: 10,
                  label: "index.vue",
                },
              ],
            },
            {
              id: 2,
              label: "documentation",
              children: [
                {
                  id: 10,
                  label: "index.vue",
                },
              ],
            },
            {
              id: 3,
              label: "singapore",
              children: [
                {
                  id: 9,
                  label: "_name.vue",
                },
                {
                  id: 10,
                  label: "index.vue",
                },
              ],
            },
            {
              id: 4,
              label: "united-kingdom",
              children: [
                {
                  id: 9,
                  label: "_name.vue",
                },
                {
                  id: 10,
                  label: "index.vue",
                },
              ],
            },
            {
              id: 5,
              label: "viet-nam",
              children: [
                {
                  id: 9,
                  label: "_name.vue",
                },
                {
                  id: 10,
                  label: "index.vue",
                },
              ],
            },
            {
              id: 6,
              label: "index.vue",
            },
            {
              id: 7,
              label: "README.md",
            },
          ],
        },
        {
          id: 8,
          label: "plugins",
          children: [
            {
              id: 7,
              label: "element-ui.js",
            },
            {
              id: 7,
              label: "player.js",
            },
            {
              id: 7,
              label: "README.md",
            },
          ],
        },
        {
          id: 9,
          label: "static",
          children: [
            {
              id: 7,
              label: "assets",
              children: [
                {
                  id: 7,
                  label: "css",
                  children: [
                    {
                      id: 9,
                      label: "prism.css",
                    },
                  ],
                },
                {
                  id: 8,
                  label: "jquery-ticker",
                  children: [
                    {
                      id: 9,
                      label: "jquery.ticker.js",
                    },
                    {
                      id: 10,
                      label: "jquery.ticker.min.js",
                    },
                  ],
                },
                {
                  id: 9,
                  label: "js",
                  children: [
                    {
                      id: 9,
                      label: "jwplayer",
                      children: [
                        {
                          id: 9,
                          label: "....",
                        },
                      ],
                    },
                    {
                      id: 10,
                      label: "jquery-3.4.1.min.js",
                    },
                    {
                      id: 11,
                      label: "prism.js",
                    },
                  ],
                },
                {
                  id: 9,
                  label: "radio",
                  children: [
                    {
                      id: 9,
                      label: "australia",
                      children: [
                        {
                          id: 9,
                          label: "data.json",
                        },
                      ],
                    },
                    {
                      id: 9,
                      label: "country",
                      children: [
                        {
                          id: 9,
                          label: "data.json",
                        },
                      ],
                    },
                    {
                      id: 9,
                      label: "favorite",
                      children: [
                        {
                          id: 9,
                          label: "australia.json",
                        },
                        {
                          id: 10,
                          label: "singapore.json",
                        },
                        {
                          id: 11,
                          label: "united-kingdom.json",
                        },
                        {
                          id: 12,
                          label: "viet-nam.json",
                        },
                      ],
                    },
                    {
                      id: 9,
                      label: "singapore",
                      children: [
                        {
                          id: 9,
                          label: "data.json",
                        },
                      ],
                    },
                    {
                      id: 9,
                      label: "united-kingdom",
                      children: [
                        {
                          id: 9,
                          label: "data.json",
                        },
                      ],
                    },
                    {
                      id: 9,
                      label: "viet-nam",
                      children: [
                        {
                          id: 9,
                          label: "data.json",
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 9,
                  label: "retina",
                  children: [
                    {
                      id: 9,
                      label: "....",
                    },
                  ],
                },
                {
                  id: 9,
                  label: "videojs",
                  children: [
                    {
                      id: 9,
                      label: "....",
                    },
                  ],
                },
              ],
            },
            {
              id: 8,
              label: "README.md",
            },
          ],
        },
        {
          id: 10,
          label: "store",
          children: [
            {
              id: 7,
              label: "README.md",
            },
          ],
        },
        {
          id: 11,
          label: ".env",
        },
        {
          id: 12,
          label: "app.html",
        },
        {
          id: 13,
          label: "nuxt.config.js",
        },
        {
          id: 14,
          label: "package-lock.json (After installation)",
        },
        {
          id: 15,
          label: "package.json",
        },
        {
          id: 16,
          label: "README.md (Documentation)",
        },
      ],
      defaultProps: {
        children: "children",
        label: "label",
      },
    };
  },
};
</script>
