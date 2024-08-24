<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs
      :area="area"
      :level_1="i18n"
      :level_1_slug="slug"
      :level_2="name"
    />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Lyric -->
    <button
      class="fixed left-4 bottom-2 uppercase text-sm px-4 py-3 bg-gray-900 text-white rounded-full dark:bg-red-700 z-50"
      @click="lyric_popup = !lyric_popup"
      v-show="slug == 'viet-nam'"
    >
      <fa
        :icon="['far', 'list-music']"
        class="text-white fill-current h-5 w-5"
      />
    </button>
    <div
      class="fixed left-0 bottom-2 z-40"
      :class="lyric_popup ? '' : 'hidden'"
    >
      <div
        class="fixed sm:left-4 bottom-20 rounded-lg bg-white shadow-2xl w-full sm:w-1/2 xl:w-1/4 max-w-[450px] overflow-hidden dark:bg-gray-700 dark:text-white"
      >
        <!-- Text -->
        <div class="">
          <div class="relative overflow-hidden px-8 pt-8">
            <div
              width="80"
              height="77"
              class="absolute -top-10 -right-10 text-yellow-500"
            >
              <svg
                width="120"
                height="119"
                viewBox="0 0 120 119"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  opacity="0.3"
                  d="M6.38128 49.1539C3.20326 32.893 13.809 17.1346 30.0699 13.9566L70.3846 6.07751C86.6455 2.89948 102.404 13.5052 105.582 29.7661L113.461 70.0808C116.639 86.3417 106.033 102.1 89.7724 105.278L49.4577 113.157C33.1968 116.335 17.4384 105.729 14.2604 89.4686L6.38128 49.1539Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div class="text-2xl flex flex-col pb-4">
              <small id="song"></small>
              <span class="text-3xl font-bold"> {{ $t("panel.lyric") }} </span>
            </div>
            <div class="pb-4 overflow-y-auto h-64" id="lyric">
              <span v-html="lyric" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- END - Lyric -->

    <!-- BEGIN - Player -->
    <Player
      ref="player"
      :stream="stream_name"
      :country="i18n"
      :song="song"
      :program="program"
      :info="info"
    ></Player>
    <!-- END - Player -->

    <!-- BEGIN - PanelStation -->
    <PanelStation :area="area" :slug="slug" :i18n="i18n" />
    <!-- END - PanelStation -->
  </div>
</template>

<script>
export default {
  name: " Country Detail",
  head() {
    const pageTitle = `${this.name} - ${this.$t("navmenu.homepage")} - Radio ${this.$t(this.i18n)}`;
    const pageDescription = `Radio Online at ${this.name} - ${this.$t(this.i18n)}`;

    return {
      title: pageTitle,
      meta: [
        {
          hid: "description",
          name: "description",
          content: pageDescription,
        },
        {
          property: "og:title",
          content: pageTitle,
        },
        // {
        //   property: "og:image",
        //   content: process.env.BASE_URL + this.get_head("features"),
        // },
        // {
        //   property: "og:description",
        //   content: process.env.DESCRIPTION || "",
        // },
        // { property: "og:type", content: "music.radio_station" },
        // {
        //   property: "og:url",
        //   content: process.env.BASE_URL + $nuxt.$route.path,
        // },
        // {
        //   property: "og:image:alt",
        //   content: `Radio Internet | ${process.env.WEBSITE_NAME}`,
        // },
        // {
        //   property: "og:site_name",
        //   content: `Radio Internet | ${process.env.WEBSITE_NAME}`,
        // },
        // {
        //   property: "music:creator",
        //   content: process.env.FANPAGE,
        // },
        // {
        //   property: "og:audio",
        //   content: this.get_head("stream"),
        // },
        // { property: "og:audio:type", content: this.get_head("type") },
        // { property: "application-name", content: process.env.WEBSITE_NAME },
      ],
    };
  },
  data() {
    return {
      name: null,
      title: "Radio in Internet",
      slug: this.$route.params.country,
      area: this.$route.params.area,
      i18n: `world.${this.area}.${this.slug}`,
      description: "",
      stream_name: process.env.WEBSITE_NAME,
      program: [],
      song: {},
      info: [],
      polling_schedule: null,
      polling_song: null,
      polling_title: null,
      lyric_popup: false,
      lyric: this.$t("panel.updating"),
    };
  },
  beforeDestroy() {
    window.clearTimeout(this.polling_schedule);
    window.clearTimeout(this.polling_song);
  },
  methods: {
    fetchData() {
      this.i18n = `world.${this.area.replace("-", "_")}.${this.slug.replace("-", "_")}`;
      this.thumb = `/img/${this.area}/flags/${this.slug}.png`;
      this.title = `${this.name} - ${this.$t("navmenu.homepage")} - Radio ${this.$t(this.i18n)}`;

      this.$axios
        .get(`/assets/radio/${this.area}/${this.slug}.json`)
        .then((res) => {
          const $t = this.$t.bind(this);
          if (
            Object.prototype.hasOwnProperty.call(
              res.data,
              this.$route.params.station,
            )
          ) {
            const data = res.data[this.$route.params.station];

            // Set variable
            this.name = data.title;
            this.description = data.description;
            this.stream_name = data.title;
            // Vuex
            this.$store.dispatch("storePLAYER", data);

            this.$refs.player.init();

            // Schedule
            if (data.schedule !== undefined) {
              this.fetchSchedule(data.schedule);
            }
          } else {
            this.$confirm($t("404.content"), "Warning", {
              confirmButtonText: $t("button.back"),
              showCancelButton: false,
              closeOnPressEscape: false,
              closeOnClickModal: false,
              showClose: false,
              type: "warning",
              center: true,
            })
              .then(() => {
                this.$router.push("/");
              })
              .catch(() => {
                this.$message({
                  type: "info",
                  message: "Delete canceled",
                });
              });
          }
        });
    },
    fetchSchedule(url) {
      this.$axios
        .get(url + this.$moment().tz("Asia/Ho_Chi_Minh").unix())
        .then((res) => {
          if (res.data.err === 0) {
            this.program = res.data.data.items;

            this.fetchSong(
              `${process.env.API_ZING_LIVE_STREAM_PROGRAM_DETAIL}${res.data.data.items[0].encodeId}&time=`,
            );
          }
          // Loop
          const self = this;
          window.clearTimeout(this.polling_schedule);
          this.polling_schedule = setInterval(() => {
            self.fetchSchedule(url);
          }, 60000);
        });
    },
    fetchSong(url) {
      this.$axios
        .get(url + this.$moment().tz("Asia/Ho_Chi_Minh").unix())
        .then((res) => {
          if (res.data.err === 0) {
            this.song = res.data.data;
          }
          // BEGIN - Browser title
          document.title = this.title;
          if (this.song !== undefined && this.song.currentMedia !== undefined) {
            document.title = `${this.song.currentMedia.title} - ${this.song.currentMedia.artists} | ${this.title}`;
          }
          // END - Browser title
          // BEGIN - Lyric
          $("#song").text(
            `${this.song.currentMedia.title} - ${this.song.currentMedia.artists}`,
          );
          if (this.song.currentMedia.hasLyric) {
            this.fetchLyric(this.song.currentMedia.encodeId);
          } else {
            this.lyric = this.$t("panel.no_lyric");
          }
          // END - Lyric
          // Loop
          const self = this;
          window.clearTimeout(this.polling_song);
          this.polling_song = setInterval(() => {
            self.fetchSong(url);
          }, 60000);
        });
    },
    fetchInfo(url) {
      this.$axios
        .get(url + this.$moment().tz("Asia/Ho_Chi_Minh").unix())
        .then((res) => {
          if (res.data.success) {
            this.info = res.data;
          }
          // Loop
          const self = this;
          setInterval(() => {
            self.fetchInfo(url);
          }, 60000);
        });
    },
    fetchLyric(id) {
      this.$axios
        .get(
          `${process.env.API_ZING_GET_LYRIC}${id}&time=${this.$moment().tz("Asia/Ho_Chi_Minh").unix()}`,
        )
        .then((res) => {
          if (res.data.err === 0) {
            if (res.data.data.sentences) {
              let lyric = "";
              let lyric_line = "";
              for (let i = 0; i < res.data.data.sentences.length; i++) {
                const words = res.data.data.sentences[i].words;

                lyric_line = "";
                for (let x = 0; x < words.length; x++) {
                  if (x === 0) {
                    lyric_line += words[x].data;
                  } else {
                    lyric_line += ` ${words[x].data}`;
                  }
                }

                lyric += `<p class="pb-1">${lyric_line}</p>`;
              }
              this.lyric = lyric;
            } else {
              this.lyric = this.$t("panel.no_lyric");
            }
          } else {
            this.lyric = this.$t("panel.no_lyric");
          }
        });
    },
  },
  created() {
    this.$store.dispatch("storeTIMEZONE", {
      area: this.area,
      country: this.slug,
    });
    Promise.all([this.fetchData()]);
  },
};
</script>
