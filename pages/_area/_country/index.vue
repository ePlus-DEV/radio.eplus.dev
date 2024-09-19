<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs
      :area="area"
      :level_1="i18n"
      :level_1_slug="slug"
      :thumb="thumb"
    />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Player -->
    <Player
      ref="player"
      :stream="stream_name"
      :country="i18n"
      :song="song"
      :program="program"
      :info="info"
      :playlist="data"
      :current="current"
      :home="true"
      :thumb="thumb"
    />
    <!-- END - Player -->

    <!-- BEGIN - PanelStation -->
    <PanelStation :area="area" :slug="slug" :i18n="i18n" />
    <!-- END - PanelStation -->
  </div>
</template>

<script>
export default {
  name: "Country",
  head() {
    const pageTitle = `${this.$t("navmenu.homepage")} - Radio ${this.$t(this.i18n)}`;
    const pageDescription = `Radio Online at ${this.$t(this.i18n)}`;

    return {
      title: pageTitle,
      meta: [
        {
          hid: "description",
          name: "description",
          content: pageDescription,
        },
      ],
    };
  },
  data() {
    return {
      slug: this.$route.params.country,
      area: this.$route.params.area,
      i18n: `world.${this.area}.${this.slug}`,
      thumb: `/img/${this.area}/flags/${this.slug}.png`,
      stream_name: process.env.WEBSITE_NAME,
      program: [],
      song: {},
      info: [],
      current: {},
      data: [],
      polling_schedule: null,
      polling_song: null,
      polling_title: null,
      lyric_popup: false,
      lyric: this.$t("panel.updating"),
      timezone: this.$store.state.timezone,
    };
  },
  beforeDestroy() {
    window.clearTimeout(this.polling_schedule);
    window.clearTimeout(this.polling_song);
  },
  methods: {
    fetchData() {
      this.i18n = `world.${this.area.replace(/-/g, '_')}.${this.slug.replace(/-/g, '_')}`;
      this.thumb = `/img/${this.area}/flags/${this.slug}.png`;

      this.$axios
        .get(`/assets/radio/${this.area}/${this.slug}.json`)
        .then((res) => {
          const favoriteChannel = Object.values(res.data).find(
            (channel) => channel.favorite,
          );
          this.stream_name = favoriteChannel.title;

          // Vuex
          this.$store.dispatch("storePLAYERHOME", favoriteChannel);
          this.$refs.player.init(true);

          // Schedule
          if (favoriteChannel.schedule !== undefined) {
            this.fetchSchedule(favoriteChannel.schedule);
          }
        })
        .catch(() => {
          this.$router.push(`/${this.area}`);
        });
    },
    fetchSchedule(url) {
      this.$axios
        .get(url + this.$moment().tz(this.timezone).unix())
        .then((res) => {
          if (res.data.err === 0 && this.slug === "viet-nam") {
            this.program = res.data.data.items;

            this.fetchSong(
              `${process.env.API_ZING_LIVE_STREAM_PROGRAM_DETAIL}${res.data.data.items[0].encodeId}&time=`,
            );
          } else {
            if (res.data.success) {
              this.data = res.data.result;
            }
            // BEGIN - Browser title
            document.title = this.title;
            if (this.data !== undefined && this.data.length > 0) {
              document.title = `${this.data[0].track_title} - ${this.data[0].track_artist} | ${this.title}`;
            }
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
        .get(url + this.$moment().tz(this.timezone).unix())
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
        .get(url + this.$moment().tz(this.timezone).unix())
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
    // Kiểm tra area phải nằm trong các khu vực được phép
    if (!this.$config.Area.includes(this.area)) {
      this.$router.push("/");
    }
    this.$store.dispatch("storeTIMEZONE", {
      area: this.area.replace(/-/g, '_'),
      country: this.slug,
    });
    Promise.all([this.fetchData()]);
  },
};
</script>
