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
            :data-tip="$t(country.name)" :to="`africa/${index}`" v-for="(country, index) in world.africa"
            :key="country.name">
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
            :data-tip="$t(country.name)" :to="`asia/${index}`" v-for="(country, index) in world.asia" :key="index">
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
            :data-tip="$t(country.name)" :to="`central-america/${index}`"
            v-for="(country, index) in world.central_america" :key="index">
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
            :data-tip="$t(country.name)" :to="`europe/${index}`" v-for="(country, index) in world.europe" :key="index">
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
            :data-tip="$t(country.name)" :to="`north-america/${index}`" v-for="(country, index) in world.north_america"
            :key="index">
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
            :data-tip="$t(country.name)" :to="`oceania/${index}`" v-for="(country, index) in world.oceania"
            :key="index">
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
      try {
        const res = await this.$axios.get("/assets/radio/countries.json");
        this.world = res.data;
        const self = this;

        // BEGIN - Africa
        for (const [key, country] of Object.entries(res.data.africa)) {
          const countryData = await self.$axios.get(country.data);
          self.world.africa[key].station = Object.keys(countryData.data).length;
        }
        // END - Africa

        // BEGIN - Asia
        for (const [key, country] of Object.entries(res.data.asia)) {
          const countryData = await self.$axios.get(country.data);
          self.world.asia[key].station = Object.keys(countryData.data).length;
        }
        // END - Asia

        // BEGIN - Central America
        for (const [key, country] of Object.entries(res.data.central_america)) {
          const countryData = await self.$axios.get(country.data);
          self.world.central_america[key].station = Object.keys(countryData.data).length;
        }
        // END - Central America

        // BEGIN - Europe
        for (const [key, country] of Object.entries(res.data.europe)) {
          const countryData = await self.$axios.get(country.data);
          self.world.europe[key].station = Object.keys(countryData.data).length;
        }
        // END - Europe

        // BEGIN - North America
        for (const [key, country] of Object.entries(res.data.north_america)) {
          const countryData = await self.$axios.get(country.data);
          self.world.north_america[key].station = Object.keys(countryData.data).length;
        }
        // END - North America

        // BEGIN - Oceania
        for (const [key, country] of Object.entries(res.data.oceania)) {
          const countryData = await self.$axios.get(country.data);
          self.world.oceania[key].station = Object.keys(countryData.data).length;
        }
        // END - Oceania
      } catch (error) {
        console.error(error);
      }
    },
  },
  created() {
    this.fetchData();
  },
};
</script>
