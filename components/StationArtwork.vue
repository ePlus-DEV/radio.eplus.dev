<template>
  <img :src="resolvedSrc" :alt="alt" :class="''" decoding="async" :loading="eager ? 'eager' : 'lazy'" @error="failed = true" />
</template>
<script setup lang="ts">
const props = defineProps<{ src?: string; alt: string; eager?: boolean }>();
const failed = ref(false);
watch(() => props.src, () => { failed.value = false; });
const resolvedSrc = computed(() => failed.value || !props.src ? '/brand/onair-mark.svg' : props.src);
</script>
