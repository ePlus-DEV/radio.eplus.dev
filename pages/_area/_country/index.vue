<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs :level_1="i18n" :level_1_slug="slug" :thumb="thumb" />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Player -->
    <Player ref="player" :country="i18n" :home="true" :thumb="thumb" :current="current" :timezone="timezone" />
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
    const pageTitle = `${this.$t("navmenu.homepage")} - Radio ${this.$t(this.i18n)} - `;
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
      current: {},
      polling_song: null,
      timezone: "Asia/Singapore",
    };
  },
  beforeDestroy() {
    window.clearTimeout(this.polling_song);
  },
  methods: {
    fetchData() {
      this.i18n = `world.${this.area}.${this.slug}`;
      this.thumb = `/img/${this.area}/flags/${this.slug}.png`;

      this.$axios.get(`/assets/radio/favorite/${this.slug}.json`).then((res) => {
        const data = res.data;

        // Vuex
        this.$store.dispatch("storePLAYERHOME", data);

        this.$refs.player.init(true);
      });
    },
    currentSong() {
      this.$axios
        .get("https://cms.camokakis.sg/api/response-get-channel/POWER98_LOVESONGS")
        .then((res) => {
          this.current = res.data;
          // Loop
          window.clearTimeout(this.polling_song);
          this.polling_song = setInterval(() => {
            self.currentSong();
          }, 60000);
          if (error.response) {
            if (error.response.status === 502) {
              location.reload();
            }
          }
        });
    },
  },
  created() {
    Promise.all([this.fetchData()]).then(() => {
      if (this.slug === 'singapore') {
        this.currentSong();
      }
    });
  },
};
</script>
