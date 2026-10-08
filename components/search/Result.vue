<template>
  <div>
    <div class="block" v-for="item in result" :key="item.objectID || item.url">
      <nuxt-link
        :to="item.url"
        class="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-[var(--radio-hover)] focus:outline-none focus:ring-2 focus:ring-rose-400/40"
        @click="$emit('select')"
      >
        <img
          class="radio-themed-artwork h-11 w-11 shrink-0 rounded-xl object-contain p-1 ring-1 ring-[var(--radio-border)]"
          :src="item.station_image"
          :alt="item.station_name"
        />
        <span dir="auto" class="min-w-0 flex-1 truncate text-sm font-medium text-[var(--radio-text)]">
          {{ item.station_name }}
        </span>
        <span class="hidden shrink-0 text-xs text-slate-400 sm:block">
          {{ $t(item.station_country) }}
        </span>
      </nuxt-link>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (event: "select"): void;
}>();

defineProps({
  result: {
    type: Array,
    default: () => [
      {
        station_name: "Xone FM 96MHz",
        station_country: "world.asia.viet_nam",
        station_image: "https://radio.eplus.dev/img/asia/viet-nam/xone.png",
        url: "/asia/viet-nam/xone-fm-96-mhz",
      },
      {
        station_name: "EDM Radio - Zing MP3",
        station_country: "world.asia.viet_nam",
        station_image:
          "https://radio.eplus.dev/img/asia/viet-nam/edm-radio-zing-mp3.png",
        url: "/asia/viet-nam/edm-radio-zing-mp3",
      },
      {
        station_name: "US-UK Radio - Zing MP3",
        station_country: "world.asia.viet_nam",
        station_image:
          "https://radio.eplus.dev/img/asia/viet-nam/us-uk-radio-zing-mp3.png",
        url: "/asia/viet-nam/us-uk-radio-zing-mp3",
      },
      {
        station_name: "Power 98 Love Songs",
        station_country: "world.asia.singapore",
        station_image: "https://radio.eplus.dev/img/asia/singapore/power.png",
        url: "/asia/singapore/power",
      },
      {
        station_name: "Heart UK",
        station_country: "world.europe.united_kingdom",
        station_image:
          "https://radio.eplus.dev/img/europe/united-kingdom/heart.png",
        url: "/europe/united-kingdom/heart-uk",
      },
    ],
  },
});
</script>
