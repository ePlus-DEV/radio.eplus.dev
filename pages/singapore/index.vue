<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs
      level_1="world.asia.singapore"
      :level_1_slug="slug"
      thumb="/img/asia/flags/singapore.png"
    />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Player -->
    <Player
      ref="player"
      country="world.asia.singapore"
      :home="true"
      thumb="/img/asia/flags/singapore.png"
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
