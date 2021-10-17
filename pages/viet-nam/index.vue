<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">{{
        $t("navmenu.homepage")
      }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ $t("world.asia.vietnam") }}</el-breadcrumb-item>
    </el-breadcrumb>

    <Player country="world.asia.vietnam" :schedule="schedule_data" />

    <nuxt-link to="/">home</nuxt-link>

    <!-- <PanelStation :area="area" :slug="slug" :i18n="i18n" /> -->
  </div>
</template>

<script>
// To import only MediaElement class
import "mediaelement";
import "mediaelement/build/mediaelementplayer.min.css";
import PanelStation from "~/components/PanelStation.vue";
import Player from "~/components/Player.vue";
import Hls from "hls.js";

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

        var audio = document.querySelector("#player");
        if (Hls.isSupported()) {
          var hls = new Hls();
          hls.loadSource(res.data["stream"]);
          hls.attachMedia(audio);
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
