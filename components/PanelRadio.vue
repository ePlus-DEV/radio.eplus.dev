<template>
  <div>
    <!-- BEGIN - Asia -->
    <div class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3">
      <div class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg">
        <h2 class="text-2xl dark:text-white">{{ $t("world.africa.name") }}</h2>
      </div>
      <div class="flex items-center justify-center">
        <div class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 m-4">
          <!-- BEGIN - Country -->
          <nuxt-link
            class="tooltip border border-base-300 dark:border-gray-600 hover:border-purple-700 dark:hover:border-white indicator"
            :data-tip="$t(country.name)" :to="index" v-for="(country, index) in world.africa" :key="country.name">
            <div class="indicator-item badge badge-accent">
              {{ country.station }}
            </div>

            <nuxt-img loading="lazy" :src="$config.Base_URL + country.flag" :alt="$t(country.name)"
              class="p-0 sm:p-1 md:p-5 lg:p-10" />
          </nuxt-link>
          <!-- END - Country -->
        </div>
      </div>
    </div>
    <!-- END - Asia -->

    <!-- BEGIN - Asia -->
    <div class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3">
      <div class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg">
        <h2 class="text-2xl dark:text-white">{{ $t("world.asia.name") }}</h2>
      </div>
      <div class="flex items-center justify-center">
        <div class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 m-4">
          <!-- BEGIN - Country -->
          <nuxt-link
            class="tooltip border border-base-300 dark:border-gray-600 hover:border-purple-700 dark:hover:border-white indicator"
            :data-tip="$t(country.name)" :to="index" v-for="(country, index) in world.asia" v-bind:key="index">
            <div class="indicator-item badge badge-accent">
              {{ country.station }}
            </div>
            <nuxt-img loading="lazy" :src="$config.Base_URL + country.flag" :alt="$t(country.name)"
              class="p-0 sm:p-1 md:p-5 lg:p-10" />
          </nuxt-link>
          <!-- END - Country -->
        </div>
      </div>
    </div>
    <!-- END - Asia -->

    <!-- BEGIN - Central America -->
    <div class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3">
      <div class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg">
        <h2 class="text-2xl dark:text-white">
          {{ $t("world.central_america.name") }}
        </h2>
      </div>
      <div class="flex items-center justify-center">
        <div class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 m-4">
          <!-- BEGIN - Country -->
          <nuxt-link
            class="tooltip border border-base-300 dark:border-gray-600 hover:border-purple-700 dark:hover:border-white indicator"
            :data-tip="$t(country.name)" :to="index" v-for="(country, index) in world.central_america"
            v-bind:key="index">
            <div class="indicator-item badge badge-accent">
              {{ country.station }}
            </div>

            <nuxt-img loading="lazy" :src="$config.Base_URL + country.flag" :alt="$t(country.name)"
              class="p-0 sm:p-1 md:p-5 lg:p-10" />
          </nuxt-link>
          <!-- END - Country -->
        </div>
      </div>
    </div>
    <!-- END - Central America -->

    <!-- BEGIN - Europe -->
    <div class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3">
      <div class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg">
        <h2 class="text-2xl dark:text-white">{{ $t("world.europe.name") }}</h2>
      </div>
      <div class="flex items-center justify-center">
        <div class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 m-4">
          <!-- BEGIN - Country -->
          <nuxt-link
            class="tooltip border border-base-300 dark:border-gray-600 hover:border-purple-700 dark:hover:border-white indicator"
            :data-tip="$t(country.name)" :to="index" v-for="(country, index) in world.europe" v-bind:key="index">
            <div class="indicator-item badge badge-accent">
              {{ country.station }}
            </div>

            <nuxt-img loading="lazy" :src="$config.Base_URL + country.flag" :alt="$t(country.name)"
              class="p-0 sm:p-1 md:p-5 lg:p-10" />
          </nuxt-link>
          <!-- END - Country -->
        </div>
      </div>
    </div>
    <!-- END - Europe -->

    <!-- BEGIN - North America -->
    <div class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3">
      <div class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg">
        <h2 class="text-2xl dark:text-white">
          {{ $t("world.north_america.name") }}
        </h2>
      </div>
      <div class="flex items-center justify-center">
        <div class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 m-4">
          <!-- BEGIN - Country -->
          <nuxt-link
            class="tooltip border border-base-300 dark:border-gray-600 hover:border-purple-700 dark:hover:border-white indicator"
            :data-tip="$t(country.name)" :to="index" v-for="(country, index) in world.north_america" v-bind:key="index">
            <div class="indicator-item badge badge-accent">
              {{ country.station }}
            </div>

            <nuxt-img loading="lazy" :src="$config.Base_URL + country.flag" :alt="$t(country.name)"
              class="p-0 sm:p-1 md:p-5 lg:p-10" />
          </nuxt-link>
          <!-- END - Country -->
        </div>
      </div>
    </div>
    <!-- END - North America -->

    <!-- BEGIN - Oceania -->
    <div class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3">
      <div class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg">
        <h2 class="text-2xl dark:text-white">
          {{ $t("world.oceania.name") }}
        </h2>
      </div>
      <div class="flex items-center justify-center">
        <div class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 m-4">
          <!-- BEGIN - Country -->
          <nuxt-link
            class="tooltip border border-base-300 dark:border-gray-600 hover:border-purple-700 dark:hover:border-white indicator"
            :data-tip="$t(country.name)" :to="index" v-for="(country, index) in world.oceania" v-bind:key="index">
            <div class="indicator-item badge badge-accent">
              {{ country.station }}
            </div>

            <nuxt-img loading="lazy" :src="$config.Base_URL + country.flag" :alt="$t(country.name)"
              class="p-0 sm:p-1 md:p-5 lg:p-10" />
          </nuxt-link>
          <!-- END - Country -->
        </div>
      </div>
    </div>
    <!-- END - Oceania -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      world: {
        asia: {},
        central_america: {},
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
        // BEGIN - Africa
        $.each(res.data.africa, function (key, country) {
          self.$axios.get(country.data).then((res) => {
            self.world.africa[key]["station"] = Object.keys(res.data).length;
          });
        });
        // END - Africa

        // BEGIN - Asia
        $.each(res.data.asia, function (key, country) {
          self.$axios.get(country.data).then((res) => {
            self.world.asia[key]["station"] = Object.keys(res.data).length;
          });
        });
        // END - Asia

        // BEGIN - Central America
        $.each(res.data.central_america, function (key, country) {
          self.$axios.get(country.data).then((res) => {
            self.world.central_america[key]["station"] = Object.keys(res.data).length;
          });
        });
        // END - Central America

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
    Promise.all([this.fetchData()]).then(() => {});
  },
};
</script>
