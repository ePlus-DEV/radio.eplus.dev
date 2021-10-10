<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">{{
        $t("navmenu.homepage")
      }}</el-breadcrumb-item>
    </el-breadcrumb>

    <Player country="world.asia.vietnam" :schedule="schedule_data"></Player>

    <PanelRadio></PanelRadio>
  </div>
</template>

<script>
// To import only MediaElement class
import "mediaelement";
import "mediaelement/build/mediaelementplayer.min.css";
import PanelRadio from "~/components/PanelRadio.vue";
import Player from "~/components/Player.vue";

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

          var player = new MediaElementPlayer("player", {
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

          player.setSrc(res.data["stream"]);

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

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}

.ticker {
  width: 500px;
  margin: 10px auto;
}

/* The HTML list gets replaced with a single div,
     which contains the active ticker item, so you
     can easily style that as well */
.ticker div {
  display: inline-block;
  word-wrap: break-word;
}
</style>
