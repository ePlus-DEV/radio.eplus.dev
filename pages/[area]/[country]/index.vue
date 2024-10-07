<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs
      :area="Array.isArray(area) ? area[0] : area"
      :level_1="i18n"
      :level_1_slug="Array.isArray(slug) ? slug[0] : slug"
    />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Player -->
    <Player
      :country="i18n"
      :home="true"
      :thumb="thumb"
      :streamName="streamName"
      :streamUrl="streamUrl"
    ></Player>
    <!-- END - Player -->

    <!-- BEGIN - PanelStation -->
    <PanelStation />
    <!-- END - PanelStation -->
  </div>
</template>

<script setup lang="ts">
import type { AudioSrc, AudioMimeType } from "vidstack";
const { t } = useI18n();
const runtimeConfig = useRuntimeConfig();
const streamName = ref<string>("");
const route = useRoute();
const streamUrl = ref<AudioSrc>({ src: "", type: "audio/mpeg" });
const slug = ref(route.params.country);
const country = ref(
  Array.isArray(route.params.country)
    ? route.params.country[0].replace(/-/g, "_")
    : route.params.country.replace(/-/g, "_"),
);
const area = ref(route.params.area);
// const { result, search } = useAlgoliaSearch("radio.eplus.dev");

const thumb = computed(
  () =>
    `/img/${area.value ? area.value : "asia"}/flags/${slug.value ? slug.value : "viet-nam"}.png`,
);

const i18n = computed(
  () => `world.${String(area.value).replace(/-/g, "_")}.${country.value}`,
);

useHead({
  title: t(i18n.value),
});

useSeoMeta({
  // will be inferred as the lastmod value in the sitemap
  articleModifiedTime: new Date().toISOString(),
});

// onMounted(async () => {
//   await search({
//     query: "",
//     requestOptions: { hitsPerPage: 200, facetFilters: [`station_country:world.${String(area.value).replace(/-/g, "_")}.${country.value}`] },
//   });
// });

/**
 * Fetches data from the server and initializes the player with the favorite channel.
 */
const { data, error } = useFetch(`/radio/${area.value}/${slug.value}.json`);

watchEffect(() => {
  if (error.value) {
    console.error("Error fetching data:", error.value);
    return;
  }

  if (!data.value) {
    console.error("No data returned from fetch");
    return;
  }

  interface Channel {
    favorite: boolean;
    title: string;
    stream: string;
    type: string;
    cros: boolean;
  }

  const favoriteChannel = Object.values(
    data.value as Record<string, Channel>,
  ).find((channel) => channel.favorite);

  if (!favoriteChannel) {
    console.error("Favorite channel not found");
    return;
  }

  streamName.value = favoriteChannel.title;
  streamUrl.value = {
    src: favoriteChannel.cros
      ? `${runtimeConfig.public.corsServer}${favoriteChannel.stream}`
      : favoriteChannel.stream,
    type: favoriteChannel.type as AudioMimeType,
  };
});
</script>
