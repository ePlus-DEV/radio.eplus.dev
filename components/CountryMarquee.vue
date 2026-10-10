<template>
  <span ref="viewport" class="country-marquee-viewport block min-w-0 w-full overflow-hidden whitespace-nowrap" :title="text">
    <span
      ref="content"
      class="country-marquee-content inline-block whitespace-nowrap"
      :class="{ 'country-marquee-content--overflow': overflowPixels > 1 }"
      :style="overflowPixels > 1 ? {
        '--country-marquee-shift': `-${overflowPixels + 2}px`,
        '--country-marquee-duration': `${Math.min(18, Math.max(6, 4 + overflowPixels / 18))}s`,
      } : undefined"
    >{{ text }}</span>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{ text: string }>();

const viewport = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);
const overflowPixels = ref(0);
let resizeObserver: ResizeObserver | undefined;

function measureOverflow() {
  if (!viewport.value || !content.value) return;
  // Measure the label, not the card: only names that are genuinely clipped scroll.
  overflowPixels.value = Math.max(0, Math.ceil(content.value.scrollWidth - viewport.value.clientWidth));
}

onMounted(() => {
  void nextTick(measureOverflow);
  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver(measureOverflow);
    if (viewport.value) resizeObserver.observe(viewport.value);
    if (content.value) resizeObserver.observe(content.value);
  }
  window.addEventListener("resize", measureOverflow);
});

watch(() => props.text, () => { void nextTick(measureOverflow); });

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  window.removeEventListener("resize", measureOverflow);
});
</script>

<style scoped>
.country-marquee-content {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.country-marquee-content--overflow {
  max-width: none;
  overflow: visible;
  text-overflow: clip;
  animation: country-marquee-slide var(--country-marquee-duration) linear infinite alternate;
}
@keyframes country-marquee-slide {
  0%, 14% { transform: translateX(0); }
  86%, 100% { transform: translateX(var(--country-marquee-shift)); }
}
@media (hover: hover) {
  .country-marquee-viewport:hover .country-marquee-content--overflow {
    animation-play-state: paused;
  }
}
@media (prefers-reduced-motion: reduce) {
  .country-marquee-content--overflow {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    animation: none;
  }
}
</style>
