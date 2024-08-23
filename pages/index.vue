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
    async fetchData() {
      this.$axios
        .get(
          `/assets/radio/favorite/${this.$config.Pin_Channel_Favorites}.json`,
        )
        .then((res) => {
          const data = res.data;
          this.stream_name = data.title;

          // Vuex
          this.$store.dispatch("storePLAYERHOME", data);

          this.$refs.player.init(true);

          // Get Schedule
          var form = new FormData();
          form.append("vov", "vovgthn");
          form.append(
            "date",
            this.$moment().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY"),
          );
          var self = this;

          var settings = {
            url: data.schedule,
            method: "POST",
            timeout: 0,
            processData: false,
            mimeType: "multipart/form-data",
            contentType: false,
            data: form,
          };

          $.ajax(settings).done(function (response) {
            self.schedule_data = JSON.parse(response).result_detail;
          });
        });
    },
    fetchRemote(url, options = {}) {
      return this.$cloudinary.image.fetchRemote(url, options);
    },
  },
  created() {
    Promise.all([this.fetchData()]).then(() => {});
  },
};
</script>
