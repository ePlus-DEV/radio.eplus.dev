<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs :level_1="i18n" :level_1_slug="slug" :level_2="name" />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Player -->
    <Player ref="player" :stream="stream_name" :country="i18n"></Player>
    <!-- END - Player -->

    <!-- BEGIN - PanelStation -->
    <PanelStation :area="area" :slug="slug" :i18n="i18n" />
    <!-- END - PanelStation -->
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: this.title,
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Radio in " + this.title_slug
        }
      ]
    };
  },
  data() {
    return {
      name: null,
      title: "Radio in " + this.title_slug,
      title_slug: "Korea",
      slug: "korea",
      stream_name: process.env.Site_Name,
      area: "asia",
      i18n: "world.asia.korea",
      data: []
    };
  },
  methods: {
    async fetchData() {
      this.$axios
        .get("/assets/radio/" + this.area + "/" + this.slug + ".json")
        .then(res => {
          const $t = this.$t.bind(this);
          if (res.data.hasOwnProperty(this.$route.params.name)) {
            const data = res.data[this.$route.params.name];

            // Set variable
            this.name = data.title;
            this.description = data.description;
            this.stream_name = data.title;
            // Vuex
            this.$store.dispatch("storePLAYER", data);

            var self = this;
            self.title =
              data.title +
              " - " +
              $t("panel.radio_in", { name: this.title_slug });

            self.$emit("updateHead");
            this.$refs.player.init();

            // Schedule
            if (data.schedule !== undefined) {
              this.fetchSchedule(data.schedule);
            }
          } else {
            this.$confirm($t("404.content"), "Warning", {
              confirmButtonText: $t("button.back"),
              showCancelButton: false,
              closeOnPressEscape: false,
              closeOnClickModal: false,
              showClose: false,
              type: "warning",
              center: true
            })
              .then(() => {
                this.$router.push("/");
              })
              .catch(() => {
                this.$message({
                  type: "info",
                  message: "Delete canceled"
                });
              });
          }
        });
    },
    async fetchSchedule(url) {
      this.$axios
        .get(
          url +
            this.$moment()
              .tz("Asia/Seoul")
              .unix()
        )
        .then(res => {
          if (res.data.success) {
            this.data = res.data.result;
          }

          // Loop
          var self = this;
          setTimeout(function() {
            self.fetchSchedule(url);
          }, 60000);
        });
    }
  },
  created() {
    Promise.all([this.fetchData()]).then(() => {});
  }
};
</script>
