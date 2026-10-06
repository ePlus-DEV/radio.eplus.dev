<template>
  <div>
    <!-- BEGIN - Skeleton -->
    <div v-if="loading">
      <div
        v-for="i in chooseTheArea ? 1 : 7"
        :key="i"
        class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3"
      >
        <div
          class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg"
        >
          <h2 class="text-2xl dark:text-white animate-pulse">
            <div
              class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"
            ></div>
          </h2>
        </div>
        <div class="flex items-center justify-center">
          <div
            class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 m-4 animate-pulse"
          >
            <div
              v-for="n in 16"
              :key="n"
              class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-600 min-w-10 w-full sm:w-20 md:w-28 mb-4 m-2"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- END - Skeleton -->

  <!-- BEGIN - Result -->
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
            :to="country.url"
            v-for="(country, index) in continent"
            :key="index"
          >
            <div class="indicator-item text-white badge badge-accent">
              {{ country.station_count }}
            </div>
            <img
              loading="lazy"
              :src="country.flag"
              :alt="$t(country.name)"
              class="p-0 sm:p-1 md:p-5 lg:p-8"
            />
          </nuxt-link>
        </div>
      </div>
    </div>
  </div>
  <!-- END - Result -->
</template>

<script setup lang="ts">
const props = defineProps<{
  chooseTheArea?: string;
}>();

const config = useRuntimeConfig();
const algoliaConfigured = computed(() => Boolean(config.public.algoliaConfigured));
const { result, search } = useAlgoliaSearch("world");
interface Country {
  name: string;
  url: string;
  flag: string;
  station_count: number;
  category?: string; // Added optional category property
}

interface GroupedResults {
  [key: string]: Country[];
}

const world = ref<GroupedResults>({});
const loading = ref(true);

onMounted(async () => {
  if (!algoliaConfigured.value) {
    loading.value = false;
    return;
  }

  try {
    await search({
      query: "",
      requestOptions: { hitsPerPage: 100 },
    });

    const groupedResults = (result.value?.hits || []).reduce(
      (gr: GroupedResults, hit) => {
        const country = hit as unknown as Country;
        const category = country.category || "Uncategorized";
        if (!gr[category]) {
          gr[category] = [];
        }
        gr[category].push(country);
        return gr;
      },
      {},
    );

    if (props.chooseTheArea && groupedResults[props.chooseTheArea]) {
      world.value = {
        [props.chooseTheArea]: groupedResults[props.chooseTheArea],
      };
      return;
    }

    world.value = groupedResults;
  } catch (error) {
    world.value = {};
    console.error("Unable to load radio countries:", error);
  } finally {
    loading.value = false;
  }
});
</script>
