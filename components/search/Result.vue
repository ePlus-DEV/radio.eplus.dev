<template>
  <div>
    <div class="block" v-for="item in result" :key="item.objectID || item.url">
      <nuxt-link
        :to="item.url"
        class="py-2 px-2.5 flex items-center gap-x-3 hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
        @click="close"
      >
        <img
          class="shrink-0 size-10 rounded-full"
          :src="item.station_image"
          :alt="item.station_name"
        />
        <span class="text-sm text-gray-800 dark:text-neutral-200">
          {{ item.station_name }}
        </span>
        <span class="ms-auto text-xs text-gray-400 dark:text-neutral-500">
          {{ $t(item.station_country) }}
        </span>
      </nuxt-link>
    </div>
  </div>
</template>

<script setup>
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

/**
 * close search modal.
 */
const close = () => {
  const modalButton = document.querySelector(".modal-button");
  if (modalButton) {
    modalButton.click();
  }
};
</script>
