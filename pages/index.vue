<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs level_1="world.asia.viet_nam" />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Player -->
    <Player
      ref="player"
      country="world.asia.viet_nam"
      :schedule="schedule_data"
      :home="true"
      thumb="/img/asia/flags/viet-nam.png"
    ></Player>
    <!-- END - Player -->

    <!-- BEGIN - PanelRadio -->
    <PanelRadio></PanelRadio>
    <!-- BEGIN - PanelRadio -->
  </div>
</template>

<script>
export default {
  name: "Home",
  head() {
    return {
      title: this.$t("navmenu.homepage"),
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: "description",
          name: "description",
          content:
            "Radio Online Việt Nam, Singapore, Indonesia, Malaysia, Philippines, Pakistan, Hong Kong, ประเทศไทย, 中国, 台灣, Australia, New Zealand, Sri Lankā, Nepāla, United Kingdom, .v.v",
        },
      ],
    };
  },
  data() {
    return {
      schedule_data: [],
      stream_name: null,
    };
  },
  methods: {
    fetchData() {
      this.$axios
        .get(`/assets/radio/asia/${this.$config.Pin_Channel_Favorites}.json`)
        .then((res) => {
          const favoriteChannel = Object.values(res.data).find(
            (channel) => channel.favorite,
          );
          this.stream_name = favoriteChannel.title;

          // Vuex
          this.$store.dispatch("storePLAYERHOME", favoriteChannel);
          this.$refs.player.init(true);
        });
    },
    fetchRemote(url, options = {}) {
      return Promise.resolve(this.$cloudinary.image.fetchRemote(url, options));
    },
  },
  created() {
    this.$store.dispatch("storeTIMEZONE", {
      area: "asia",
      country: "viet-nam",
    });
    Promise.all([this.fetchData()]);
  },
};
</script>
