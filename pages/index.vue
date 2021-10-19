<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs level_1="world.asia.vietnam" :level_1_slug="slug" />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Player -->
    <Player
      country="world.asia.vietnam"
      :schedule="schedule_data"
      :stream="stream_name"
      thumb="/img/asia/flags/viet-nam.png"
    ></Player>
    <!-- END - Player -->

    <!-- BEGIN - PanelRadio -->
    <PanelRadio></PanelRadio>
    <!-- BEGIN - PanelRadio -->
  </div>
</template>

<script>
import Hls from "hls.js";
// import Plyr from "plyr";

export default {
  head() {
    return {
      title: this.$t("navmenu.homepage") + " - ",
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
        .get("/assets/radio/favorite/" + this.$config.Pin_Channel_Favorites + ".json")
        .then((res) => {
          const data = res.data;
          this.stream_name = data.title;
          var audio = document.querySelector("#player");

          // Check HLS
          if (data.type === "application/x-mpegURL") {
            if (Hls.isSupported()) {
              var hls = new Hls();
              hls.loadSource(res.data["stream"]);
              hls.attachMedia(audio);
            }
          }

          audio.play();
          plyr.setup(audio);

          $(".ticker").ticker();

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
    this.loading = true;
    Promise.all([this.fetchData()]).then(() => {
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      loading.close();
    });
  },
};
</script>
