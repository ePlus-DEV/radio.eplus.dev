<template>
  <!-- BEGIN - Station -->
  <div class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3">
    <div
      class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg"
    >
      <h2 class="text-2xl dark:text-white">{{ $t(i18n) }}</h2>
    </div>
    <div class="flex items-center justify-center">
      <div
        class="grid grid-cols-4 gap-4 m-4 sm:grid-cols-4 md:grid-cols-8 sm:gap-1 sm:m-1"
      >
        <nuxt-link
          :to="`${data.url}`"
          v-for="(data, index) in results"
          v-bind:key="index"
          class="border tooltip tooltip-left"
          active-class="active border-red-700"
          :title="data.title"
          :data-tip="data.title"
          :class="[
            isRouteActive(data.objectID)
              ? 'border-red-700 dark:border-red-600'
              : 'border-base-300 dark:border-gray-600 hover:border-purple-700 dark:hover:border-white hover:shadow-2xl hover:scale-105 transform transition-all duration-500',
          ]"
        >
          <img
            loading="lazy"
            :src="data.station_image"
            :alt="data.title"
            class="p-0 sm:p-1 md:p-5 lg:p-10"
          />
        </nuxt-link>
      </div>
    </div>
  </div>
  <!-- END - Station -->
</template>

<script lang="ts" setup>
const config = useRuntimeConfig();
const route = useRoute();
const { result, search } = useAlgoliaSearch(config.public.algoliaIndexStation);
const country = ref(
  Array.isArray(route.params.country)
    ? route.params.country[0].replace(/-/g, "_")
    : route.params.country.replace(/-/g, "_")
);
const area = ref(route.params.area);
// skipcq: JS-0323
const results = ref<any[]>([]);
const i18n = ref(`world.${String(area.value).replace(/-/g, "_")}.${country.value}`);

onMounted(async () => {
  await search({
    query: "",
    requestOptions: { hitsPerPage: 200, facetFilters: [`station_country:world.${String(area.value).replace(/-/g, "_")}.${country.value}`] },
  });

  results.value = result.value.hits;
});

/**
 * Checks if the given path is the active route.
 * @param {string} path - The path to check.
 * @returns {boolean} - True if the path is the active route, false otherwise.
 */
const isRouteActive = (path: string): boolean => {
  return path === `${route.params.country}-${route.params.station}`;
};
</script>
