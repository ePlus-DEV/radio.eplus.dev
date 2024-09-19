<template>
  <div>
    <!-- BEGIN - Skeleton -->
    <div v-if="world.length === 0">
      <div v-for="i in chooseTheArea ? 1 : 7" :key="i" class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3">
        <div class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg">
          <h2 class="text-2xl dark:text-white animate-pulse">
            <div class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
          </h2>
        </div>
        <div class="flex items-center justify-center">
          <div class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 m-4 animate-pulse">
            <div v-for="n in 16" :key="n"
              class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-600 min-w-10 w-full sm:w-20 md:w-28 mb-4 m-2">
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- END - Skeleton -->

    <div v-for="(continent, continentIndex) in world" :key="continentIndex">
      <div class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3">
        <div class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg">
          <h2 class="text-2xl dark:text-white">
            {{ $t(`world.${continentIndex}.name`) }}
          </h2>
        </div>
        <div class="flex items-center justify-center">
          <div class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 m-4">
            <nuxt-link
              class="tooltip border border-base-300 dark:border-gray-600 hover:border-purple-700 dark:hover:border-white indicator"
              :data-tip="$t(country.name)" :to="country.url" v-for="(country, index) in continent" :key="index">
              <div class="indicator-item badge badge-accent">
                {{ country.station_count }}
              </div>
              <nuxt-img loading="lazy" :src="country.flag" :alt="$t(country.name)" class="p-0 sm:p-1 md:p-5 lg:p-10"
                :placeholder="$config.placeholder" />
            </nuxt-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import algoliasearch from "algoliasearch";

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
      world: [],
    };
  },
  created() {
    const client = algoliasearch(
      process.env.ALGOLIA_APP_ID,
      process.env.ALGOLIA_WRITE_API_KEY,
    );
    const index = client.initIndex("world");

    index.search("", { hitsPerPage: 100 }).then(({ hits }) => {
      let filteredHits = hits;
      if (this.chooseTheArea) {
        filteredHits = hits.filter(
          (item) => item.category === this.chooseTheArea,
        );
      }
      this.world = filteredHits.reduce((grouped, item) => {
        const category = item.category;
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(item);
        return grouped;
      }, {});
    });
  },
};
</script>
<style>
.min-w-10 {
  min-width: 2.5rem;
}
</style>
