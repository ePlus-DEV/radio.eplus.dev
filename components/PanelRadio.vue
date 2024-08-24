<template>
  <div>
    <div v-for="(continent, continentIndex) in world" :key="continentIndex">
      <div class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3">
        <div
          class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg"
        >
          <h2 class="text-2xl dark:text-white">
            {{ $t(`world.${continentIndex}.name`) }}
          </h2>
        </div>
        <div class="flex items-center justify-center">
          <div class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 m-4">
            <nuxt-link
              class="tooltip border border-base-300 dark:border-gray-600 hover:border-purple-700 dark:hover:border-white indicator"
              :data-tip="$t(country.name)"
              :to="`${continentIndex.replace('_', '-')}/${index}`"
              v-for="(country, index) in continent"
              :key="index"
            >
              <div class="indicator-item badge badge-accent">
                {{ country.station }}
              </div>
              <nuxt-img
                loading="lazy"
                :src="$config.Base_URL + country.flag"
                :alt="$t(country.name)"
                class="p-0 sm:p-1 md:p-5 lg:p-10"
              />
            </nuxt-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PanelRadio",
  props: {
    chooseTheArea: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      world: {},
    };
  },
  methods: {
    async fetchData() {
      try {
        const res = await this.$axios.get("/assets/radio/countries.json");
        this.world = this.chooseTheArea
          ? { [this.chooseTheArea]: res.data[this.chooseTheArea] }
          : res.data;
        for (const [continentKey, continent] of Object.entries(this.world)) {
          for (const [countryKey, country] of Object.entries(continent)) {
            const countryData = await this.$axios.get(country.data);
            this.world[continentKey][countryKey].station = Object.keys(
              countryData.data,
            ).length;
          }
        }
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
