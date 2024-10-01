<script setup lang="ts">
const { data } = await useAsyncAlgoliaSearch({
  indexName: "test_index",
  query: "Samsung",
});
</script>

<template>
  <div>{{ data }}</div>
</template>
