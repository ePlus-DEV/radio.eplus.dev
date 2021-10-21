<template>
  <div class="transform -rotate-1 pb-8">
    <!-- BEGIN - Player -->
    <div
      class="flex bg-white dark:bg-gray-900 shadow-md rounded-lg overflow-hidden mx-auto"
    >
      <div class="flex flex-col w-full">
        <div class="flex items-center p-5 border-b">
          <img
            class="w-35 h-25 object-cover"
            :key="home !== undefined ? player_home.title : player.title"
            :src="home !== undefined ? thumb : player.features"
          />
          <div class="flex flex-col px-2 w-full">
            <span class="text-xs text-gray-700 dark:text-white uppercase font-medium">
              {{ $t("panel.play_from_radio") }}
            </span>
            <span
              class="text-sm text-red-500 dark:text-white capitalize font-semibold pt-1"
            >
              {{ home !== undefined ? player_home.title : player.title }}
            </span>
            <span class="text-xs text-gray-500 uppercase font-medium">
              {{ $t(country) }}
            </span>
          </div>
          <div class="flex">
            <svg width="24" height="24" fill="none">
              <path
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              ></path>
            </svg>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center p-5">
          <div class="flex items-center">
            <div class="flex space-x-3 p-2">
              <button class="focus:outline-none">
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef4444"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polygon points="19 20 9 12 19 4 19 20"></polygon>
                  <line x1="5" y1="19" x2="5" y2="5"></line>
                </svg>
              </button>
              <!-- BEIGN - Button Play -->
              <button
                v-show="!waiting"
                :class="[!button ? 'hidden' : '']"
                @click="onPause"
              >
                <svg width="50" height="50" fill="none">
                  <circle
                    class="text-gray-300 dark:text-gray-500"
                    cx="25"
                    cy="25"
                    r="24"
                    stroke="#ef4444"
                    stroke-width="1.5"
                  />
                  <path d="M18 16h4v18h-4V16zM28 16h4v18h-4z" fill="#ef4444" />
                </svg>
              </button>
              <!-- END - Button Play -->
              <!-- END - Button Pause -->
              <button
                v-show="!waiting"
                type="button"
                :class="[button ? 'hidden' : '']"
                @click="onPlay"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="50"
                  height="50"
                  viewBox="0 0 50 50"
                  style="fill: #ef4444"
                >
                  <path
                    d="M 7.3847656 1 C 6.4461117 1 5.5415977 1.3405474 4.921875 2.0078125 C 4.3021523 2.6750776 4 3.6068401 4 4.6347656 L 4 45.363281 C 4 46.391594 4.3021532 47.324738 4.921875 47.992188 C 5.5415968 48.659636 6.4461117 49 7.3847656 49 C 8.3762396 49 9.2122771 48.715937 10.015625 48.251953 L 28.146484 37.875 L 32.5 35.384766 L 44.769531 28.361328 L 44.771484 28.361328 C 45.865386 27.730994 47 26.626492 47 25 C 47 23.374065 45.86621 22.267775 44.767578 21.636719 L 42.203125 20.162109 C 39.90096 12.564756 32.841808 7.0195313 24.5 7.0195312 C 23.002786 7.0195312 21.554957 7.2177954 20.160156 7.5546875 L 10.015625 1.7480469 C 9.2129723 1.2838219 8.3762396 1 7.3847656 1 z M 7.3847656 3 C 8.0612916 3 8.3743246 3.1106937 9.0136719 3.4804688 L 9.015625 3.4804688 L 17.574219 8.3769531 C 10.796043 11.124024 6 17.76442 6 25.519531 C 6 32.87687 10.305274 39.237376 16.539062 42.214844 L 9.0175781 46.519531 L 9.015625 46.519531 C 8.3749698 46.889548 8.0612916 47 7.3847656 47 C 6.8924196 47 6.6032001 46.86191 6.3886719 46.630859 C 6.1741437 46.399809 6 46.012969 6 45.363281 L 6 25.519531 L 6 4.6347656 C 6 3.9856912 6.1741445 3.6001256 6.3886719 3.3691406 C 6.6031992 3.1381557 6.8924196 3 7.3847656 3 z M 24.5 9.0195312 C 33.624562 9.0195312 41 16.394969 41 25.519531 C 41 26.493839 40.896196 27.440628 40.734375 28.367188 L 35.542969 31.337891 C 36.468902 29.593602 37 27.608349 37 25.5 C 37 18.608285 31.391715 13 24.5 13 C 17.608285 13 12 18.608285 12 25.5 C 12 32.206368 17.315024 37.682153 23.951172 37.972656 L 18.708984 40.972656 C 12.45608 38.628715 8 32.602733 8 25.519531 C 8 16.394969 15.375438 9.0195314 24.5 9.0195312 z M 24.5 15 C 30.310835 15 35 19.689165 35 25.5 C 35 31.310835 30.310835 36 24.5 36 C 18.689165 36 14 31.310835 14 25.5 C 14 19.689165 18.689165 15 24.5 15 z M 25 19 L 25 26.044922 C 24.6 25.815922 24.14225 25.673828 23.65625 25.673828 C 22.17025 25.673828 21 26.875937 21 28.335938 C 21 29.825937 22.168 31 23.625 31 C 25.111 31 26.5 29.836 26.5 28.375 L 26.5 21.875 L 29 21.875 L 29 19 L 25 19 z M 42.777344 22.798828 L 43.771484 23.371094 C 44.594852 23.844038 45 24.229935 45 25 C 45 25.769508 44.595488 26.153287 43.773438 26.626953 L 42.927734 27.111328 C 42.972432 26.586102 43 26.055979 43 25.519531 C 43 24.592654 42.909399 23.689399 42.777344 22.798828 z"
                  ></path>
                </svg>
              </button>
              <!-- END - Button Pause -->
              <!-- Waiting -->
              <svg
                v-show="waiting"
                class="animate-spin -ml-1 mr-3 text-red-500"
                width="50"
                height="50"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <!-- Waiting -->
              <button class="focus:outline-none">
                <svg
                  class="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef4444"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polygon points="5 4 15 12 5 20 5 4"></polygon>
                  <line x1="19" y1="5" x2="19" y2="19"></line>
                </svg>
              </button>
            </div>
          </div>
          <div class="relative w-full ml-2">
            <!-- <div class="bg-red-300 h-2 w-full rounded-lg"></div>
            <div class="bg-red-500 h-2 w-1/2 rounded-lg absolute top-0"></div> -->

            <vue-plyr ref="plyr" @player="setPlayer">
              <audio controls crossorigin playsinline id="player" class="hidden">
                <!-- <source :src="player_home.stream" :type="player_home.type" /> -->
              </audio>
            </vue-plyr>

            <!-- <div class="ticker radio-name-player dark:text-white">
              <ul>
                <li>{{ $t("panel.play_from_radio") }} {{ stream }}</li>
                <li>
                  <template v-if="country !== undefined">
                    {{ $t("panel.most_popular", { name: $t(country) }) }}
                  </template>
                  <template v-else>
                    {{ country }}
                  </template>
                </li>
                <li>
                  {{ $t("panel.frequency") }}
                </li>
              </ul>
            </div> -->
          </div>
          <!-- <div class="flex justify-end w-full sm:w-auto pt-1 sm:pt-0">
            <span
              class="text-xs dark:text-white text-gray-700 uppercase font-medium pl-2"
            >
              02:00/04:00
            </span>
          </div> -->
        </div>
        <!-- BEGIN - Playlist -->
        <!--  <div class="flex flex-col p-5">
          <div class="border-b pb-1 flex justify-between items-center mb-2">
            <span class="text-base dark:text-white font-semibold uppercase text-gray-700">
              play list</span
            >
            <img
              class="w-4 cursor-pointer"
              src="https://p.kindpng.com/picc/s/152-1529312_filter-ios-filter-icon-png-transparent-png.png"
            />
          </div>

          <div class="flex border-b py-3 cursor-pointer hover:shadow-md px-2">
            <img
              class="w-10 h-10 object-cover rounded-lg"
              alt="User avatar"
              src="https://images.unsplash.com/photo-1477118476589-bff2c5c4cfbb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=200&q=200"
            />
            <div class="flex flex-col px-2 w-full">
              <span
                class="text-sm dark:text-white text-red-500 capitalize font-semibold pt-1"
              >
                I think I need a sunrise, I'm tired of the sunset
              </span>
              <span class="text-xs dark:text-white text-gray-500 uppercase font-medium">
                -"Boston," Augustana
              </span>
            </div>
          </div>
          <div class="flex border-b py-3 cursor-pointer hover:shadow-md px-2">
            <img
              class="w-10 h-10 object-cover rounded-lg"
              alt="User avatar"
              src="https://images.unsplash.com/photo-1477118476589-bff2c5c4cfbb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=200&q=200"
            />
            <div class="flex flex-col px-2 w-full">
              <span
                class="text-sm dark:text-white text-red-500 capitalize font-semibold pt-1"
              >
                I think I need a sunrise, I'm tired of the sunset
              </span>
              <span class="text-xs dark:text-white text-gray-500 uppercase font-medium">
                -"Boston," Augustana
              </span>
            </div>
          </div>
        </div> -->
        <!-- END - Playlist -->
      </div>
    </div>
    <!-- END - Player -->
  </div>
</template>

<script>
import Hls from "hls.js";

export default {
  props: ["country", "home", "playlist", "schedule", "thumb"],
  data() {
    return {
      now: null,
      button: false,
      waiting: false,
    };
  },
  mounted() {
    this.$refs.plyr.player.on("event", () => console.log("event fired"));
    this.$refs.plyr.player.on("ready", (event) => {
      console.log(event);
    });
    this.$refs.plyr.player.on("canplay", (event) => {
      console.log(event.detail.plyr);
    });
    this.$refs.plyr.player.on("waiting", (event) => {
      // const instance = event.detail.plyr;
      console.log("waiting");
      this.waiting = true;
    });
    this.$refs.plyr.player.on("playing", (event) => {
      console.log("playing");
      this.button = true;
      this.waiting = false;
    });
    this.$refs.plyr.player.on("pause", (event) => {
      console.log("pause");
      this.button = false;
      this.waiting = false;
    });
    this.$refs.plyr.player.on("stopped", (event) => {
      console.log("stopped");
    });
  },
  computed: {
    player() {
      return this.$store.state.player;
    },
    player_home() {
      return this.$store.state.player_home;
    },
  },
  methods: {
    init(state = false) {
      var audio = document.querySelector("#player");

      if (state) {
        // Check Cros
        if (this.$store.state.player_home.cros) {
          var stream_url =
            process.env.CORS_SERVER_1 + this.$store.state.player_home.stream;
        } else {
          var stream_url = this.$store.state.player_home.stream;
        }
        // Check Type
        if (
          this.$store.state.player_home.type === "application/x-mpegURL" ||
          this.$store.state.player_home.type === "audio/x-mpegurl"
        ) {
          if (Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(stream_url);
            hls.attachMedia(audio);
          }

          const playPromise = audio.play();

          if (playPromise !== undefined) {
            playPromise
              .then((_) => {
                // Automatic playback started!
                // Show playing UI.
              })
              .catch((error) => {
                // Auto-play was prevented
                // Show paused UI.
                console.log(error);
              });
          }
        } else {
          this.setPlayer(stream_url, this.$store.state.player.type);
        }
      } else {
        // Check Cros
        if (this.$store.state.player.cros) {
          var stream_url = process.env.CORS_SERVER_1 + this.$store.state.player.stream;
        } else {
          var stream_url = this.$store.state.player.stream;
        }
        // Check Type
        if (
          this.$store.state.player.type === "application/x-mpegURL" ||
          this.$store.state.player.type === "audio/x-mpegurl"
        ) {
          if (Hls.isSupported()) {
            var hls = new Hls();
            hls.loadSource(stream_url);
            hls.attachMedia(audio);
          }

          const playPromise = audio.play();

          if (playPromise !== undefined) {
            playPromise
              .then((_) => {
                // Automatic playback started!
                // Show playing UI.
              })
              .catch((error) => {
                // Auto-play was prevented
                // Show paused UI.
                console.log(error);
              });
          }
        } else {
          this.setPlayer(stream_url, this.$store.state.player.type);
        }
      }
    },
    setPlayer(stream_url, type) {
      let player = this.$refs.plyr.player;
      player.source = {
        type: "audio",
        sources: [
          {
            src: stream_url,
            type: type,
          },
        ],
      };

      player.play();

      /*  var audio = document.querySelector("#player");
      audio.play(); */
    },
    onPlay() {
      var audio = document.querySelector("#player");
      audio.play();
    },
    onPause() {
      var audio = document.querySelector("#player");
      audio.pause();
    },
    check(key, time) {
      var arr = time.split("-");
      var format = "HH:mm";
      var hours = this.$moment().tz("Asia/Ho_Chi_Minh").format(format);
      var beforeTimeformat = this.$moment(arr[0].replace("h", ":"), "HH:mm")
        .tz("Asia/Ho_Chi_Minh")
        .format("HH:mm");

      var beforeTime = this.$moment(arr[0].replace("h", ":"), format).tz(
        "Asia/Ho_Chi_Minh"
      );

      var afterTime = this.$moment(arr[1].replace("h", ":"), format).tz(
        "Asia/Ho_Chi_Minh"
      );

      var afterTimeformat = this.$moment(arr[1].replace("h", ":"), "HH:mm")
        .tz("Asia/Ho_Chi_Minh")
        .format("HH:mm");

      if (
        this.$moment(hours, "HH:mm").isSameOrAfter(beforeTime) &&
        this.$moment(hours, "HH:mm").isSameOrAfter(afterTime)
      ) {
        return "#F56C6C";
      }
      // Check Live
      if (this.$moment(hours, "HH:mm").isBetween(beforeTime, afterTime)) {
        return "#0bbd87";
      } else {
        return "#e0dee9";
      }
    },
  },
  created() {
    setInterval(() => {
      this.now = this.$moment().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY HH:mm:ss ZZ");
    }, 1000);
  },
};
</script>
<style>
.plyr__controls__item.plyr__control.plyr__control--pressed {
  display: none;
}
</style>
