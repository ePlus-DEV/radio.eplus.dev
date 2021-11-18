<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs :level_1="i18n" :level_1_slug="slug" :level_2="name" />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Player -->
    <Player ref="player" :stream="stream_name" :country="i18n" :playlist="data"></Player>
    <!-- END - Player -->

    <!-- BEGIN - PanelStation -->
    <PanelStation :area="area" :slug="slug" :i18n="i18n" />
    <!-- END - PanelStation -->
  </div>
</template>

<script>
import thailand from "@/static/assets/radio/asia/thailand.json";

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
      title_slug: "thailand",
      slug: "thailand",
      stream_name: process.env.Site_Name,
      area: "asia",
      i18n: "world.asia.thailand",
      data: [],
      thumb: null,
    };
  },
  methods: {
    get_head(params) {
      if (thailand.hasOwnProperty(this.$route.params.name)) {
        return thailand[this.$route.params.name][params];
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
      this.$axios.get(url + this.$moment().tz("Asia/Bangkok").unix()).then((res) => {
        if (res.data.success) {
          this.data = res.data.result;
        }

        // Loop
        var self = this;
        setTimeout(function () {
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
