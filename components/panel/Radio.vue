<template>
  <div>
    {{ result }}
  </div>
</template>

<script setup lang="ts">
const { result, search } = useAlgoliaSearch("world");

// interface Country {
//   name: string;
//   url: string;
//   flag: string;
//   station_count: number;
// }

// interface Continent {
//   [key: string]: Country[];
// }

// const props = defineProps<{
//   chooseTheArea: string;
// }>();

// const config = useRuntimeConfig();
// const world = ref<Continent>({});

// const client = algoliasearch(config.ALGOLIA_APP_ID, config.ALGOLIA_WRITE_API_KEY);
// const index = client.initIndex('world');

// const { data } = await useAsyncData('worldData', () => index.search('', { hitsPerPage: 100 }));

// if (data.value) {
//   let filteredHits = data.value.hits;
//   if (props.chooseTheArea) {
//     filteredHits = filteredHits.filter((item: any) => item.category === props.chooseTheArea);
//   }
//   world.value = filteredHits.reduce((grouped: Continent, item: any) => {
//     const category = item.category;
//     if (!grouped[category]) {
//       grouped[category] = [];
//     }
//     grouped[category].push(item);
//     return grouped;
//   }, {});
// }

onMounted(async () => {
  await search({ query: "Samsung" });
});
</script>

<style>
.min-w-10 {
  min-width: 2.5rem;
}
</style>
