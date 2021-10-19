<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs level_1="world.asia.vietnam" :level_1_slug="slug" :level_2="name" />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Player -->
    <Player :stream="stream_name" stream_url="stream_url"></Player>
    <!-- END - Player -->

    <!-- BEGIN - PanelStation -->
    <PanelStation :area="area" :slug="slug" :i18n="i18n" />
    <!-- END - PanelStation -->
  </div>
</template>

<script>
import Hls from "hls.js";

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
      area: "asia",
      i18n: "world.asia.vietnam",
      description: "",
      stream_name: process.env.Site_Name,
      stream_url: null,
    };
  },
  /* mounted() {
    this.$axios
      .get("/assets/radio/" + this.area + "/" + this.slug + ".json")
      .then((res) => {
        const $t = this.$t.bind(this);
        if (res.data.hasOwnProperty(this.$route.params.name)) {
          const data = res.data[this.$route.params.name];

          this.name = data.title;
          this.description = data.description;
          this.stream_name = data.title;

          var self = this;
          self.title =
            data.title + " - " + $t("panel.radio_in", { name: this.title_slug });
          self.$emit("updateHead");

          var audio = document.querySelector("#player");

          const url = new URL(data.stream);

          if (url.protocol == "http:") {
            this.stream_url = process.env.CORS_SERVER_1 + data.stream;
          } else {
            this.stream_url = data.stream;
          }
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
  }, */
  methods: {
    async fetchData() {
      this.$axios
        .get("/assets/radio/" + this.area + "/" + this.slug + ".json")
        .then((res) => {
          this.$store.dispatch("storeVN", res.data);
          const $t = this.$t.bind(this);
          if (res.data.hasOwnProperty(this.$route.params.name)) {
            const data = res.data[this.$route.params.name];

            this.name = data.title;
            this.description = data.description;
            this.stream_name = data.title;

            var self = this;
            self.title =
              data.title + " - " + $t("panel.radio_in", { name: this.title_slug });
            self.$emit("updateHead");

            var audio = document.querySelector("#player");
            var stream_url = "";
            const url = new URL(data.stream);

            /*  if (url.protocol == "http:") {
              stream_url += process.env.CORS_SERVER_1 + data.stream;
            } else {
              stream_url += data.stream;
            } */

            // Check HLS
            if (data.type === "application/x-mpegURL") {
              if (Hls.isSupported()) {
                var hls = new Hls();
                hls.loadSource(data.stream);
                hls.attachMedia(audio);
              }
            }

            audio.play();
            plyr.setup(audio);

            $(".ticker").ticker();
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
    Promise.all([this.fetchData()]).then(() => {});
  },
};
</script>
