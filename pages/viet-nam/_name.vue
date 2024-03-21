<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs :level_1="i18n" :level_1_slug="slug" :level_2="name" />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Lyric -->
    <button
      class="fixed left-4 bottom-2 uppercase text-sm px-4 py-3 bg-gray-900 text-white rounded-full dark:bg-red-700 z-50"
      @click="lyric_popup = !lyric_popup"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        class="text-white fill-current h-5 w-5"
      >
        <path
          d="M24 95.97h240c13.25 0 24-10.75 24-24s-10.75-24-24-24h-240c-13.25 0-24 10.75-24 24S10.75 95.97 24 95.97zM498.8 6.162c-8.25-6.125-18.69-7.699-28.44-4.699l-112 35.38C345.1 41.09 336 53.34 336 67.34v299.1c-18.12-9.125-40.13-14.5-64-14.5c-61.88 0-112 35.88-112 80C160 476.1 210.1 512 272 512s112-35.88 112-80V195.4l105.6-33.38C503 157.7 512 145.5 512 131.5V31.96C512 21.71 507.1 12.16 498.8 6.162zM272 463.1c-39.75 0-64-20.75-64-31.1c0-11.25 24.25-32 64-32s64 20.75 64 32C336 443.2 311.8 463.1 272 463.1zM464 119.7L384 144.1V79.09l80-25.25V119.7zM24 223.1h240c13.25 0 24-10.75 24-24s-10.75-24-24-24h-240c-13.25 0-24 10.74-24 24S10.75 223.1 24 223.1zM136 303.1h-112c-13.25 0-24 10.75-24 24s10.75 24 24 24h112c13.25 0 24-10.75 24-24S149.3 303.1 136 303.1z"
        />
      </svg>
    </button>
    <div class="fixed left-0 bottom-2 z-40" :class="lyric_popup ? '' : 'hidden'">
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
              <span v-html="lyric"> </span>
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
import vietnam from "@/static/assets/radio/asia/viet-nam.json";

export default {
  head() {
    return {
      title: this.get_head("title"),
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Radio in " + this.title_slug,
        },
        {
          property: "og:title",
          content:
            this.get_head("title") + " - Radio Internet | " + process.env.WEBSITE_NAME,
        },
        {
          property: "og:image",
          content: process.env.BASE_URL + this.get_head("features"),
        },
        {
          property: "og:description",
          content: process.env.DESCRIPTION || "",
        },
        { property: "og:type", content: "music.radio_station" },
        {
          property: "og:url",
          content: process.env.BASE_URL + $nuxt.$route.path,
        },
        {
          property: "og:image:alt",
          content: "Radio Internet | " + process.env.WEBSITE_NAME,
        },
        {
          property: "og:site_name",
          content: "Radio Internet | " + process.env.WEBSITE_NAME,
        },
        {
          property: "music:creator",
          content: process.env.FANPAGE,
        },
        {
          property: "og:audio",
          content: this.get_head("stream"),
        },
        { property: "og:audio:type", content: this.get_head("type") },
        { property: "application-name", content: process.env.WEBSITE_NAME },
      ],
    };
  },
  data() {
    return {
      name: null,
      title: "Radio in " + this.title_slug,
      title_slug: "Việt Nam",
      slug: "viet-nam",
      area: "asia",
      i18n: "world.asia.vietnam",
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
    get_head(params) {
      if (vietnam.hasOwnProperty(this.$route.params.name)) {
        return vietnam[this.$route.params.name][params];
      }
    },
    async fetchData() {
      this.$axios
        .get("/assets/radio/" + this.area + "/" + this.slug + ".json")
        .then((res) => {
          const $t = this.$t.bind(this);
          if (res.data.hasOwnProperty(this.$route.params.name)) {
            const data = res.data[this.$route.params.name];

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
    async fetchSchedule(url) {
      this.$axios.get(url + this.$moment().tz("Asia/Ho_Chi_Minh").unix()).then((res) => {
        if (res.data.err === 0) {
          this.program = res.data.data.items;

          this.fetchSong(
            process.env.API_ZING_LIVE_STREAM_PROGRAM_DETAIL +
              res.data.data.items[0].encodeId +
              "&time="
          );
        }
        // Loop
        var self = this;
        window.clearTimeout(this.polling_schedule);
        this.polling_schedule = setInterval(function () {
          self.fetchSchedule(url);
        }, 60000);
      });
    },
    async fetchSong(url) {
      this.$axios.get(url + this.$moment().tz("Asia/Ho_Chi_Minh").unix()).then((res) => {
        if (res.data.err === 0) {
          this.song = res.data.data;
        }
        // BEGIN - Browser title
        document.title = this.get_head("title");
        if (this.song !== undefined && this.song.currentMedia !== undefined) {
          document.title =
            this.song.currentMedia.title +
            " - " +
            this.song.currentMedia.artists +
            " | " +
            this.get_head("title");
        }
        // END - Browser title
        // BEGIN - Lyric
        $("#song").text(
          this.song.currentMedia.title + " - " + this.song.currentMedia.artists
        );
        if (this.song.currentMedia.hasLyric) {
          this.fetchLyric(this.song.currentMedia.encodeId);
        } else {
          this.lyric = this.$t("panel.no_lyric");
        }
        // END - Lyric
        // Loop
        var self = this;
        window.clearTimeout(this.polling_song);
        this.polling_song = setInterval(function () {
          self.fetchSong(url);
        }, 60000);
      });
    },
    async fetchInfo(url) {
      var fetch;
      this.$axios.get(url + this.$moment().tz("Asia/Ho_Chi_Minh").unix()).then((res) => {
        if (res.data.success) {
          this.info = res.data;
        }
        // Loop
        var self = this;
        // clearTimeout(fetch);
        fetch = setInterval(function () {
          self.fetchInfo(url);
        }, 60000);
      });
    },
    async fetchLyric(id) {
      this.$axios
        .get(
          process.env.API_ZING_GET_LYRIC +
            id +
            "&time=" +
            this.$moment().tz("Asia/Ho_Chi_Minh").unix()
        )
        .then((res) => {
          if (res.data.err === 0) {
            if (res.data.data.sentences) {
              var lyric = "";
              for (let i = 0; i < res.data.data.sentences.length; i++) {
                const words = res.data.data.sentences[i].words;

                var lyric_line = "";
                for (let x = 0; x < words.length; x++) {
                  if (x === 0) {
                    lyric_line += words[x].data;
                  } else {
                    lyric_line += " " + words[x].data;
                  }
                }

                lyric += '<p class="pb-1">' + lyric_line + "</p>";
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
    Promise.all([this.fetchData()]).then(() => {});
  },
};
</script>
