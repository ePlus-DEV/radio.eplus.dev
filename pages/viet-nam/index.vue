<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs
      level_1="world.asia.vietnam"
      :level_1_slug="slug"
      thumb="/img/asia/flags/viet-nam.png"
    />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Player -->
    <Player
      ref="player"
      country="world.asia.vietnam"
      :schedule="schedule_data"
      :home="true"
      thumb="/img/asia/flags/viet-nam.png"
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
        " -  Radio " +
        this.$t("world.asia.vietnam") +
        " - ",
      meta: [
        {
          hid: "description",
          name: "description",
          content:
            "Radio Online được phát từ " +
            this.title_slug +
            " - VOV 1, VOV2, VOV3, VOV4, VOH, VOV Giao Thông",
        },
      ],
    };
  },
  data() {
    return {
      name: null,
      title: this.$t("navmenu.homepage") + " - Radio " + this.$t("world.asia.vietnam"),
      slug: "viet-nam",
      area: "asia",
      i18n: "world.asia.vietnam",
      schedule_data: [],
    };
  },
  mounted() {
    this.$axios.get("/assets/radio/favorite/" + this.slug + ".json").then((res) => {
      const data = res.data;

      // Vuex
      this.$store.dispatch("storePLAYERHOME", data);

      this.$refs.player.init(true);

      // Get Schedule
      var form = new FormData();
      form.append("vov", "vovgthn");
      form.append("date", this.$moment().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY"));
      var self = this;

      var settings = {
        url: data["schedule"],
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
  methods: {
    async fetchData() {
      this.$axios.get("/assets/radio/favorite/" + this.slug + ".json").then((res) => {
        const data = res.data;
        var notify = this.$notify;

        const $t = this.$t.bind(this);

        var audio = document.querySelector("#player");
        if (Hls.isSupported()) {
          var hls = new Hls();
          hls.loadSource(res.data["stream"]);
          hls.attachMedia(audio);
        }

        audio.play();

        // Get Schedule
        var form = new FormData();
        form.append("vov", "vovgthn");
        form.append("date", this.$moment().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY"));
        var self = this;

        var settings = {
          url: data["schedule"],
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
  },
  created() {
    /* this.loading = true;
    Promise.all([this.fetchData()]).then(() => {
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      loading.close();
    }); */
  },
};
</script>
