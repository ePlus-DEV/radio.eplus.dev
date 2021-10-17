<template>
  <div>
    <!-- <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">{{
        $t("navmenu.homepage")
      }}</el-breadcrumb-item>
    </el-breadcrumb> -->

    <Player
      :datasource="datasource"
      country="world.asia.vietnam"
      :schedule="schedule_data"
    ></Player>

    <!-- <vue-plyr ref="plyr">
      <audio autoplay controls crossorigin playsinline id="player1"></audio>
    </vue-plyr> -->

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
      datasource: null,
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
          var notify = this.$notify;
          const $t = this.$t.bind(this);

          /* var player = new MediaElementPlayer("player", {
            features: ["playpause", "progress", "tracks", "volume"],
            enableKeyboard: true,
            success: function (mediaElement) {
              // Event
              $("#player")
                .on("canplay", function () {
                  $(".mejs__time-rail").html(
                    '<div class="ticker radio-name-player"><ul><li>' +
                      $t("panel.play_from_radio") +
                      " <strong>" +
                      data["title"] +
                      "</strong></li><li>" +
                      $t("panel.frequency") +
                      ": <strong>" +
                      data["frequency"] +
                      "</strong></li><li>" +
                      $t("panel.country") +
                      ": <strong>" +
                      data["countries"] +
                      "</strong></li></ul></div>"
                  );
                  $(".ticker").ticker();
                  notify.success({
                    title: $t("notify.success"),
                    message: $t("notify.success_content", { radio: data.title }),
                  });
                })
                .on("error", function () {
                  notify.error({
                    title: $t("notify.error"),
                    message: $t("notify.error_content", { radio: data.title }),
                  });
                });

              console.info("Player initialised");
            },
          });

          player.setSrc(res.data["stream"]); */

          var audio = document.querySelector("#player");
          if (Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(res.data["stream"]);
            hls.attachMedia(audio);
          }

          // audio.play();

          // this.datasource = res.data["stream"];
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
