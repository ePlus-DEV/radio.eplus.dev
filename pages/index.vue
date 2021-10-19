<template>
  <div>
    <Player
      country="world.asia.vietnam"
      :schedule="schedule_data"
      :stream="stream_name"
      thumb="/img/asia/flags/viet-nam.png"
    ></Player>

    <div class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg">
      <div class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg">
        <h2 class="text-2xl dark:text-white">Applicant Information</h2>
        <p class="text-sm text-gray-500 dark:text-white">
          Personal details and application.
        </p>
      </div>
      <div class="flex items-center justify-center">
        <div class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 m-4">
          <div
            class="border border-base-300 dark:border-gray-600 hover:border-purple-700 dark:hover:border-white"
            v-for="index in 20"
            :key="index"
          >
            <img
              src="https://radio.eplus.dev/img/asia/flags/viet-nam.png"
              alt="Alejandro Escamilla"
              class="p-0 sm:p-1 md:p-5 lg:p-10"
            />
          </div>
        </div>
      </div>
    </div>

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
      stream_name: null,
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
          this.stream_name = data.title;
          var audio = document.querySelector("#player");

          // Check HLS
          if (data.type === "application/x-mpegURL") {
            if (Hls.isSupported()) {
              var hls = new Hls();
              hls.loadSource(res.data["stream"]);
              hls.attachMedia(audio);
            }
          }

          audio.play();
          $(".ticker").ticker();

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
