<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs :level_1="i18n" :level_1_slug="slug" :thumb="thumb" />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Player -->
    <Player
      ref="player"
      :country="i18n"
      :home="true"
      :thumb="thumb"
      :current="current"
      :timezone="timezone"
    />
    <!-- END - Player -->

    <!-- BEGIN - PanelStation -->
    <PanelStation :area="area" :slug="slug" :i18n="i18n" />
    <!-- END - PanelStation -->
  </div>
</template>

<script>
export default {
  head() {
    return {
      title:
        this.$t("navmenu.homepage") +
        " - Radio " +
        this.$t("world.asia.singapore") +
        " - ",
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Radio Online at " + this.$t("world.asia.singapore"),
        },
      ],
    };
  },
  data() {
    return {
      slug: "singapore",
      area: "asia",
      i18n: "world.asia.singapore",
      thumb: "/img/asia/flags/singapore.png",
      current: {},
      polling_song: null,
      timezone: "Asia/Singapore",
    };
  },
  beforeDestroy() {
    window.clearTimeout(this.polling_song);
  },
  methods: {
    async fetchData() {
      this.$axios.get("/assets/radio/favorite/" + this.slug + ".json").then((res) => {
        const data = res.data;

        // Vuex
        this.$store.dispatch("storePLAYERHOME", data);

        this.$refs.player.init(true);
      });
    },
    async currentSong() {
      this.$axios
        .get("https://cms.camokakis.sg/api/response-get-channel/POWER98_LOVESONGS")
        .then((res) => {
          this.current = res.data;
          // Loop
          var self = this;
          window.clearTimeout(this.polling_song);
          this.polling_song = setInterval(function () {
            self.currentSong();
          }, 60000);
        }).catch(function (error) {
          if (error.response) {
            if (error.response.status == 502) {
              location.reload();
            }
          }
        });
    },
  },
  created() {
    Promise.all([this.fetchData()]).then(() => {
      this.currentSong();
    });
  },
};
</script>
