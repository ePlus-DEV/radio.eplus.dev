<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">{{
        $t("navmenu.homepage")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/' + slug }">{{
        $t("world.asia.vietnam")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card mar-card">
      <div slot="header" class="clearfix">
        <el-badge value="Live" class="item">
          <el-button size="small">{{ this.stream_name }}</el-button>
        </el-badge>
      </div>
      <!-- BEGIN - Player -->
      <audio id="player" preload="none" autoplay width="100%"></audio>
      <div class="player-errors"></div>
      <!-- END - Player -->

      <!-- BEGIN - Description -->
      <el-card v-if="this.description.length > 0"
        ><b> {{ $t("panel.description") }}:</b> {{ this.description }}</el-card
      >
      <!-- BEGIN - Description -->
    </el-card>

    <PanelVietNam></PanelVietNam>
  </div>
</template>

<script>
// To import only MediaElement class
import "mediaelement";
import "mediaelement/build/mediaelementplayer.min.css";
import PanelVietNam from "~/components/PanelVietNam.vue";
import error from "../../static/assets/js/jwplayer/js/templates/error";

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
      title_slug: "Việt Nam",
      slug: "viet-nam",
      description: "",
      stream_name: "Radio.ePlus.DEV",
    };
  },
  components: {
    PanelVietNam,
  },
  methods: {
    async fetchData() {
      this.$axios.get("/assets/radio/" + this.slug + "/data.json").then((res) => {
        const $t = this.$t.bind(this);
        if (res.data.hasOwnProperty(this.$route.params.name)) {
          const data = res.data[this.$route.params.name];

          $("#radio-name").text(data.title);

          this.name = data.title;
          this.description = data.description;
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
