<template>
  <div>
    <!-- BEGIN - Asia -->
    <div class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg">
      <div class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg">
        <h2 class="text-2xl dark:text-white">{{ $t("world.asia.name") }}</h2>
        <!-- <p class="text-sm text-gray-500 dark:text-white">
        Personal details and application.
      </p> -->
      </div>
      <div class="flex items-center justify-center">
        <div class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 m-4">
          <!-- BEGIN - Country -->
          <template v-for="(country, index) in world.asia">
            <div
              class="border border-base-300 dark:border-gray-600 hover:border-purple-700 dark:hover:border-white indicator"
              v-bind:key="index"
            >
              <div class="indicator-item badge badge-accent">
                {{ country.station }}
              </div>
              <img
                :src="country.flag"
                :alt="$t(country.name)"
                class="p-0 sm:p-1 md:p-5 lg:p-10"
              />
            </div>
          </template>
          <!-- END - Country -->
        </div>
      </div>
    </div>
    <!-- END - Asia -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      world: {
        asia: {},
        europe: {},
        north_america: {},
        oceania: {},
      },
    };
  },
  methods: {
    async fetchData() {
      // Countries
      this.$axios.get("/assets/radio/countries.json").then((res) => {
        this.world = res.data;
        var self = this;
        // BEGIN - Asia
        $.each(res.data.asia, function (key, country) {
          self.$axios.get(country.data).then((res) => {
            self.world.asia[key]["station"] = Object.keys(res.data).length;
          });
        });
        // END - Asia

        // BEGIN - Europe
        $.each(res.data.europe, function (key, country) {
          self.$axios.get(country.data).then((res) => {
            self.world.europe[key]["station"] = Object.keys(res.data).length;
          });
        });
        // END - Europe

        // BEGIN - North America
        $.each(res.data.north_america, function (key, country) {
          self.$axios.get(country.data).then((res) => {
            self.world.north_america[key]["station"] = Object.keys(res.data).length;
          });
        });
        // END - North America

        // BEGIN - Oceania
        $.each(res.data.oceania, function (key, country) {
          self.$axios.get(country.data).then((res) => {
            self.world.oceania[key]["station"] = Object.keys(res.data).length;
          });
        });
        // END - Oceania
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
