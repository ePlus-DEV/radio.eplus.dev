<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">{{
        $t("navmenu.homepage")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("world.asia.vietnam") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <Player country="world.asia.vietnam" :schedule="schedule_data" />

    <PanelStation :area="area" :slug="slug" :i18n="i18n" />
  </div>
</template>

<script>
// To import only MediaElement class
import "mediaelement";
import "mediaelement/build/mediaelementplayer.min.css";
import PanelStation from "~/components/PanelStation.vue";
import Player from "~/components/Player.vue";

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
      title: "Radio in " + this.title_slug,
      title_slug: "Việt Nam",
      slug: "viet-nam",
      area: "asia",
      i18n: "world.asia.vietnam",
      schedule_data: [],
    };
  },
  components: {
    PanelStation,
    Player,
  },
  methods: {
    async fetchData() {
      this.$axios.get("/assets/radio/favorite/" + this.slug + ".json").then((res) => {
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

        player.setSrc(data["stream"]);

        // Get Schedule
        var form = new FormData();
        form.append("vov", "vovgthcm");
        form.append("date", "08/10/2021");

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
          // self.schedule_data = JSON.parse(response).result_detail;
        });

        //

        /*  var settings = {
          url:
            "https://cors.bridged.cc/https://vovgiaothong.vn/VOVRadio/SearchList.aspx/GetRadios",
          method: "POST",
          timeout: 0,
          headers: {
            "Content-Type": "application/json",
            Cookie: "ASP.NET_SessionId=dugde5uylpuc0csuftpnk044",
          },
          data: JSON.stringify({
            channel: "1",
            day: "01/10/2021",
          }),
        };

        $.ajax(settings).done(function (response) {
          console.log(response);
        }); */
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
