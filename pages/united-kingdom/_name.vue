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
      :playlist="data"
      :timezone="timezone"
    ></Player>
    <!-- END - Player -->

    <!-- BEGIN - PanelStation -->
    <PanelStation :area="area" :slug="slug" :i18n="i18n" />
    <!-- END - PanelStation -->
  </div>
</template>

<script>
import uk from "@/static/assets/radio/europe/united-kingdom.json";

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
      title_slug: "United Kingdom",
      slug: "united-kingdom",
      stream_name: process.env.WEBSITE_NAME,
      area: "europe",
      i18n: "world.europe.united_kingdom",
      data: [],
      thumb: null,
      polling_schedule: null,
      polling_song: null,
      timezone: "Europe/London",
    };
  },
  beforeDestroy() {
    window.clearTimeout(this.polling_schedule);
    window.clearTimeout(this.polling_song);
  },
  methods: {
    get_head(params) {
      if (uk.hasOwnProperty(this.$route.params.name)) {
        return uk[this.$route.params.name][params];
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
      this.$axios.get(url + this.$moment().tz(this.timezone).unix()).then((res) => {
        if (res.data.success) {
          this.data = res.data.result;
        }
        // BEGIN - Browser title
        document.title = this.get_head("title");
        if (this.data !== undefined && this.data.length > 0) {
          document.title =
            this.data[0].track_title +
            " - " +
            this.data[0].track_artist +
            " | " +
            this.get_head("title");
        }
        // END - Browser title
        // Loop
        var self = this;
        window.clearTimeout(this.polling_schedule);
        this.polling_schedule = setTimeout(function () {
          self.fetchSchedule(url);
        }, 60000);
      });
    },
  },
  created() {
    Promise.all([this.fetchData()]).then(() => {});
  },
};
</script>
