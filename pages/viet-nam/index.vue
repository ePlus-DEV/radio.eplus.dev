<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">{{
        $t("navmenu.homepage")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("world.asia.vietnam") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <Player country="world.asia.vietnam" />

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
      });

      // this.$axios
      //   .post(
      //     "https://cors-anywhere.herokuapp.com/corsdemo/https://vovlive.vn/api/appGetvovschedule",
      //     {
      //       vov: "vovovgthn",
      //       date: "05/10/2021",
      //     },
      //     {
      //       headers: {
      //         "Access-Control-Allow-Origin": "*",
      //       },
      //       /* proxy: {
      //         host: "104.236.174.88",
      //         port: 3128,
      //       }, */
      //     }
      //   )
      //   .then((res) => {
      //     console.log(res.data);
      //   });

      var url = "https://vovlive.vn/api/appGetvovschedule";

      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);

      xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      // xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          console.log(xhr.status);
          console.log(xhr.responseText);
        }
      };

      var data = "vov=vovgthn&date=04%2F10%2F2021";

      xhr.send(data);
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
