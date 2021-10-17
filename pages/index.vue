<template>
  <div>
    <!-- <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">{{
        $t("navmenu.homepage")
      }}</el-breadcrumb-item>
    </el-breadcrumb> -->

    <Player
      country="world.asia.vietnam"
      :schedule="schedule_data"
      :stream="stream_name"
      thumb="/img/asia/flags/viet-nam.png"
    ></Player>

    <nuxt-link to="/viet-nam">vietnam</nuxt-link>

    <!-- <PanelRadio></PanelRadio> -->
  </div>
</template>

<script>
// To import only MediaElement class
import "mediaelement";
import "mediaelement/build/mediaelementplayer.min.css";
import PanelRadio from "~/components/PanelRadio.vue";
import Player from "~/components/Player.vue";
import Hls from "hls.js";

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
  components: {
    PanelRadio,
    Player,
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
