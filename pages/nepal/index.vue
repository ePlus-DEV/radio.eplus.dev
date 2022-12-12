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
        this.$t("navmenu.homepage") + " - Radio " + this.$t("world.asia.nepal") + " - ",
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Radio Online at " + this.$t("world.asia.nepal"),
        },
      ],
    };
  },
  data() {
    return {
      slug: "nepal",
      area: "asia",
      i18n: "world.asia.nepal",
      thumb: "/img/asia/flags/nepal.png",
      timezone: "Asia/Kathmandu",
    };
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
  },
  created() {
    Promise.all([this.fetchData()]).then(() => {});
  },
};
</script>
