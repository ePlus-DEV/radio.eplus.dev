<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">{{
        $t("navmenu.homepage")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/united-kingdom' }">{{
        $t("world.europe.united_kingdom")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <Player :stream="stream_name"></Player>

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
      title: this.title,
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Radio in " + this.title_slug,
        },
      ],
    };
  },
  data() {
    return {
      name: null,
      title: "Radio in " + this.title_slug,
      title_slug: "United Kingdom",
      slug: "united-kingdom",
      stream_name: process.env.Site_Name,
      area: "europe",
      i18n: "world.europe.united_kingdom",
    };
  },
  components: {
    PanelStation,
    Player,
  },
  methods: {
    async fetchData() {
      this.$axios
        .get("/assets/radio/" + this.area + "/" + this.slug + ".json")
        .then((res) => {
          const $t = this.$t.bind(this);
          if (res.data.hasOwnProperty(this.$route.params.name)) {
            const data = res.data[this.$route.params.name];

            $("#radio-name").text(data.title);
            this.name = data.title;
            this.stream_name = data.title;
            var self = this;
            self.title =
              data.title + " - " + $t("panel.radio_in", { name: this.title_slug });
            self.$emit("updateHead");

            var notify = this.$notify;

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
                        data["url"] +
                        "</strong></li><li>" +
                        $t("panel.category") +
                        ": <strong>" +
                        data["category"] +
                        "</strong></li></ul></div>"
                    );
                    $(".ticker").ticker();
                    notify.success({
                      title: $t("notify.success"),
                      message: $t("notify.success_content", {
                        radio: data.title,
                      }),
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
            player.setSrc(data.stream);
          } else {
            this.$confirm($t("404.content"), "Warning", {
              confirmButtonText: $t("button.back"),
              showCancelButton: false,
              closeOnPressEscape: false,
              closeOnClickModal: false,
              showClose: false,
              type: "warning",
              center: true,
            })
              .then(() => {
                this.$router.push("/");
              })
              .catch(() => {
                this.$message({
                  type: "info",
                  message: "Delete canceled",
                });
              });
          }
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
