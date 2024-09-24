<template>
  <div>
    <AppHeader />
    <NuxtPage />
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  ogImage: '/og-image.png'
})
</script>