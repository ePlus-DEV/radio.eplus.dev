<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs :level_1="i18n" :level_1_slug="slug" :level_2="name" />
    <!-- END - Breadcrumbs -->

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
            this.get_head("title") + " - Radio Internet | " + process.env.Site_Name,
        },
        {
          property: "og:image",
          content: process.env.BASE_URL + this.get_head("features"),
        },
        {
          property: "og:description",
          content: process.env.Description || "",
        },
        { property: "og:type", content: "music.radio_station" },
        {
          property: "og:url",
          content: process.env.BASE_URL + $nuxt.$route.path,
        },
        {
          property: "og:image:alt",
          content: "Radio Internet | " + process.env.Site_Name,
        },
        {
          property: "og:site_name",
          content: "Radio Internet | " + process.env.Site_Name,
        },
        {
          property: "music:creator",
          content: process.env.FanPage,
        },
        {
          property: "og:audio",
          content: this.get_head("stream"),
        },
        { property: "og:audio:type", content: this.get_head("type") },
        { property: "application-name", content: process.env.Site_Name },
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
      stream_name: process.env.Site_Name,
      program: [],
      song: {},
      info: [],
      polling_schedule: null,
      polling_song: null,
      polling_title: null,
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
            /// Info
            // if (data.info !== undefined) {
            //   this.fetchInfo(data.info);
            // }
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
  },
  created() {
    Promise.all([this.fetchData()]).then(() => {});
  },
};
</script>
