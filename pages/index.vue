<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">{{
        $t("navmenu.homepage")
      }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card mar-card">
      <div slot="header" class="clearfix">
        <el-badge value="Live" class="item">
          <el-button size="small">{{
            $t("panel.most_popular", { name: $t("world.asia.vietnam") })
          }}</el-button>
        </el-badge>
        <el-badge class="item">
          <div class="ticker"></div>
        </el-badge>
      </div>

      <audio id="player" preload="auto" autoplay width="100%"></audio>
    </el-card>

    <PanelRadio></PanelRadio>
  </div>
</template>

<script>
// To import only MediaElement class
import "mediaelement";
import "mediaelement/build/mediaelementplayer.min.css";
import PanelRadio from "~/components/PanelRadio.vue";

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
  components: {
    PanelRadio,
  },
  methods: {
    async fetchData() {
      this.$axios.get("/assets/radio/favorite/viet-nam.json").then((res) => {
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
