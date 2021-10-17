<template>
  <div>
    <!-- <div class="w-full shadow stats mb-3">
      <div class="stat">
        <div class="stat-figure text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block w-8 h-8 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            ></path>
          </svg>
        </div>
        <div class="stat-title">Total Likes</div>
        <div class="stat-value text-primary">25.6K</div>
        <div class="stat-desc">21% more than last month</div>
      </div>
      <div class="stat">
        <div class="stat-figure text-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block w-8 h-8 stroke-current"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            ></path>
          </svg>
        </div>
        <div class="stat-title">Page Views</div>
        <div class="stat-value text-info">2.6M</div>
        <div class="stat-desc">21% more than last month</div>
      </div>
      <div class="stat">
        <div class="stat-figure text-info">
          <div class="avatar online">
            <div class="w-16 h-16 p-1 mask mask-squircle bg-base-100">
              <img
                src="/tailwind-css-component-profile-5@56w.png"
                alt="Avatar Tailwind CSS Component"
                class="mask mask-squircle"
              />
            </div>
          </div>
        </div>
        <div class="stat-value">86%</div>
        <div class="stat-title">Tasks done</div>
        <div class="stat-desc text-info">31 tasks remaining</div>
      </div>
    </div> -->

    <div class="flex flex-col gap-12 mb-4">
      <label class="text-gray-100 font-semibold tracking-wider text-lg">Last Week</label>
      <div
        class="bg-gray-100 rounded-lg w-full h-auto py-4 flex flex-row justify-between divide-x divide-solid divide-gray-400"
      >
        <div class="relative flex-1 flex flex-col gap-2 px-4">
          <label class="text-gray-800 text-base font-semibold tracking-wider"
            >Total Visitor</label
          >
          <label class="text-green-800 text-4xl font-bold">14K</label>
          <div
            class="absolute bg-red-400 rounded-md font-semibold text-xs text-gray-100 p-2 right-4 bottom-0"
          >
            - 5%
          </div>
        </div>
        <div class="relative flex-1 flex flex-col gap-2 px-4">
          <label class="text-gray-800 text-base font-semibold tracking-wider"
            >Total Click</label
          >
          <label class="text-green-800 text-4xl font-bold">6K</label>
          <div
            class="absolute bg-green-400 rounded-md font-semibold text-xs text-gray-100 p-2 right-4 bottom-0"
          >
            + 10%
          </div>
        </div>
        <div class="relative flex-1 flex flex-col gap-2 px-4">
          <label class="text-gray-800 text-base font-semibold tracking-wider"
            >Total Profit</label
          >
          <label class="text-green-800 text-4xl font-bold">$1.2M</label>
          <div
            class="absolute bg-green-400 rounded-md font-semibold text-xs text-gray-100 p-2 right-4 bottom-0"
          >
            + 5%
          </div>
        </div>
      </div>
    </div>

    <Player
      country="world.asia.vietnam"
      :schedule="schedule_data"
      :stream="stream_name"
      thumb="/img/asia/flags/viet-nam.png"
    ></Player>

    <div class="relative flex flex-col items-center justify-center">
      <div class="grid mt-8 gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        <div
          class="flex flex-col cursor-pointer hover:scale-105 transform transition-all duration-500"
          v-for="index in 20"
          :key="index"
        >
          <div class="bg-white shadow-md rounded-3xl p-4">
            <div class="flex-none lg:flex">
              <div class="h-full w-full lg:h-48 lg:w-48 lg:mb-0 mb-3">
                <img
                  src="https://images.unsplash.com/photo-1472148439583-1f4cf81b80e0?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1631&q=80"
                  alt="Just a flower"
                  class="w-full object-scale-down lg:object-cover lg:h-48 rounded-2xl"
                />
              </div>
              <div class="flex-auto ml-3 justify-evenly py-2">
                <div class="flex flex-wrap">
                  <div class="w-full flex-none text-xs text-blue-700 font-medium">
                    Ho Chi Minh
                  </div>
                  <h2 class="flex-auto text-lg font-medium">Vietnam</h2>
                </div>
                <p class="mt-3"></p>
                <div class="flex py-4 text-sm text-gray-500">
                  <div class="flex-1 inline-flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 mr-2 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <p class="">05-25-2021</p>
                  </div>
                </div>
                <div class="flex p-4 pb-2 border-t border-gray-200"></div>
                <div class="flex space-x-3 text-sm font-medium">
                  <div class="flex-auto flex space-x-3">
                    <button
                      class="mb-2 md:mb-0 bg-white px-4 py-2 shadow-sm tracking-wider border text-gray-600 rounded-full hover:bg-gray-100 inline-flex items-center space-x-2"
                    >
                      <span class="text-green-400 hover:text-green-500 rounded-lg">
                        <svg
                          aria-hidden="true"
                          focusable="false"
                          data-prefix="fab"
                          data-icon="shopify"
                          class="svg-inline--fa fa-shopify w-5 h-5"
                          role="img"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 448 512"
                        >
                          <path
                            fill="currentColor"
                            d="M388.32,104.1a4.66,4.66,0,0,0-4.4-4c-2,0-37.23-.8-37.23-.8s-21.61-20.82-29.62-28.83V503.2L442.76,472S388.72,106.5,388.32,104.1ZM288.65,70.47a116.67,116.67,0,0,0-7.21-17.61C271,32.85,255.42,22,237,22a15,15,0,0,0-4,.4c-.4-.8-1.2-1.2-1.6-2C223.4,11.63,213,7.63,200.58,8c-24,.8-48,18-67.25,48.83-13.61,21.62-24,48.84-26.82,70.06-27.62,8.4-46.83,14.41-47.23,14.81-14,4.4-14.41,4.8-16,18-1.2,10-38,291.82-38,291.82L307.86,504V65.67a41.66,41.66,0,0,0-4.4.4S297.86,67.67,288.65,70.47ZM233.41,87.69c-16,4.8-33.63,10.4-50.84,15.61,4.8-18.82,14.41-37.63,25.62-50,4.4-4.4,10.41-9.61,17.21-12.81C232.21,54.86,233.81,74.48,233.41,87.69ZM200.58,24.44A27.49,27.49,0,0,1,215,28c-6.4,3.2-12.81,8.41-18.81,14.41-15.21,16.42-26.82,42-31.62,66.45-14.42,4.41-28.83,8.81-42,12.81C131.33,83.28,163.75,25.24,200.58,24.44ZM154.15,244.61c1.6,25.61,69.25,31.22,73.25,91.66,2.8,47.64-25.22,80.06-65.65,82.47-48.83,3.2-75.65-25.62-75.65-25.62l10.4-44s26.82,20.42,48.44,18.82c14-.8,19.22-12.41,18.81-20.42-2-33.62-57.24-31.62-60.84-86.86-3.2-46.44,27.22-93.27,94.47-97.68,26-1.6,39.23,4.81,39.23,4.81L221.4,225.39s-17.21-8-37.63-6.4C154.15,221,153.75,239.8,154.15,244.61ZM249.42,82.88c0-12-1.6-29.22-7.21-43.63,18.42,3.6,27.22,24,31.23,36.43Q262.63,78.68,249.42,82.88Z"
                          ></path>
                        </svg>
                      </span>
                      <span>Listen</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <nuxt-link to="/viet-nam">vietnam</nuxt-link>

    <div class="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 px-4">
      <!-- SMALL CARD ROUNDED -->
      <div
        class="bg-gray-100 border-indigo-600 dark:bg-gray-800 bg-opacity-95 border-opacity-60 | p-4 border-solid rounded-3xl border-2 | flex justify-around cursor-pointer | hover:bg-indigo-400 dark:hover:bg-indigo-600 hover:border-transparent | transition-colors duration-500"
      >
        <img
          class="w-16 h-16 object-cover rounded"
          src="/img/asia/flags/viet-nam.png"
          alt=""
        />
        <div class="flex flex-col justify-center">
          <p class="text-gray-900 dark:text-gray-300 font-semibold">Netflix</p>
          <p class="text-black dark:text-gray-100 text-justify font-semibold">
            $15 000,00
          </p>
        </div>
      </div>
      <!-- END SMALL CARD ROUNDED -->

      <!-- SMALL CARD ROUNDED -->
      <div
        class="bg-gray-100 border-red-600 dark:bg-gray-800 bg-opacity-95 border-opacity-60 | p-4 border-solid rounded-3xl border-2 | flex justify-around cursor-pointer | hover:bg-red-400 dark:hover:bg-red-600 hover:border-transparent | transition-colors duration-500"
      >
        <img
          class="object-cover rounded border-red-200 border-solid"
          src="/img/asia/flags/singapore.png"
          alt=""
        />
        <div class="flex flex-col justify-center">
          <p class="text-gray-900 dark:text-gray-300 font-semibold">Netflix</p>
          <p class="text-black dark:text-gray-100 text-justify font-semibold">
            $15 000,00
          </p>
        </div>
      </div>
      <!-- END SMALL CARD ROUNDED -->

      <!-- SMALL CARD ROUNDED -->
      <div
        class="bg-gray-100 border-yellow-600 dark:bg-gray-800 bg-opacity-95 border-opacity-60 | p-4 border-solid rounded-3xl border-2 | flex justify-around cursor-pointer | hover:bg-yellow-400 dark:hover:bg-yellow-600 hover:border-transparent | transition-colors duration-500"
      >
        <img
          class="w-16 h-16 object-cover"
          src="https://milenyo.net/wp-content/uploads/2020/05/netflix-n-logo-png.png"
          alt=""
        />
        <div class="flex flex-col justify-center">
          <p class="text-gray-900 dark:text-gray-300 font-semibold">Netflix</p>
          <p class="text-black dark:text-gray-100 text-justify font-semibold">
            $15 000,00
          </p>
        </div>
      </div>
      <!-- END SMALL CARD ROUNDED -->

      <!-- SMALL CARD ROUNDED -->
      <div
        class="bg-gray-100 border-green-600 dark:bg-gray-800 bg-opacity-95 border-opacity-60 | p-4 border-solid rounded-3xl border-2 | flex justify-around cursor-pointer | hover:bg-green-400 dark:hover:bg-green-600 hover:border-transparent | transition-colors duration-500"
      >
        <img
          class="w-16 h-16 object-cover"
          src="https://milenyo.net/wp-content/uploads/2020/05/netflix-n-logo-png.png"
          alt=""
        />
        <div class="flex flex-col justify-center">
          <p class="text-gray-900 dark:text-gray-300 font-semibold">Netflix</p>
          <p class="text-black dark:text-gray-100 text-justify font-semibold">
            $15 000,00
          </p>
        </div>
      </div>
      <!-- END SMALL CARD ROUNDED -->
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

          $(".ticker").ticker();

          // Check HLS
          if (data.type === "application/x-mpegURL") {
            if (Hls.isSupported()) {
              var hls = new Hls();
              hls.loadSource(res.data["stream"]);
              hls.attachMedia(audio);
            }
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
