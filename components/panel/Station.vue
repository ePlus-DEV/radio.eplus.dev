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
          :to="`/${area}/${slug}/${index}`"
          v-for="(data, index) in results"
          v-bind:key="index"
          class="border tooltip tooltip-left"
          active-class="active border-red-700"
          :title="data.title"
          :data-tip="data.title"
          :class="[
            isRouteActive(index.toString())
              ? 'border-red-700'
              : 'border-base-300 dark:border-gray-600 hover:border-purple-700 dark:hover:border-white hover:shadow-2xl hover:scale-105 transform transition-all duration-500',
          ]"
        >
          <nuxt-img
            loading="lazy"
            :src="config.public.cloudinaryBaseUrl + data.features"
            :alt="data.title"
            class="p-0 sm:p-1 md:p-5 lg:p-10"
            :placeholder="config.public.placeholderStation"
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
interface Result {
  title: string;
  features: string;
}

const results = ref<Result[]>([]);

const props = defineProps<{
  area: string;
  slug: string;
  i18n: string;
}>();

/**
 * Fetches data from the server and updates the results.
 * @returns {Promise<void>} - A promise that resolves when the data is fetched and processed.
 */
const fetchData = async (): Promise<void> => {
  try {
    const response = await fetch(
      `radio/${props.area}/${props.slug}.json`,
    );
    const data = await response.json();

    if (!data) {
      throw new Error("No data returned from fetch");
    }

    results.value = data;

  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

onMounted(() => {
  fetchData();
});


/**
 * Checks if the given path is the active route.
 * @param {string} path - The path to check.
 * @returns {boolean} - True if the path is the active route, false otherwise.
 */
const isRouteActive = (path: string): boolean => {
 return route.params.name === path;
};
</script>