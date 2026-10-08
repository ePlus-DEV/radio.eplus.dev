<template>
  <div class="space-y-7">
    <section
      class="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white px-5 py-8 shadow-sm shadow-slate-200/40 dark:border-white/10 dark:bg-slate-900 dark:shadow-none sm:px-8 sm:py-10 lg:px-10"
    >
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.13),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.10),transparent_38%)]"
      ></div>

      <div class="relative max-w-3xl">
        <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 ring-1 ring-inset ring-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20">
          <span class="h-2 w-2 animate-pulse rounded-full bg-rose-500"></span>
          Live internet radio
        </div>

        <h1 class="text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
          Live radio from around the world
        </h1>
        <p class="mt-4 max-w-2xl text-sm leading-7 text-slate-500 dark:text-slate-400 sm:text-base">
          Browse stations by region and country, discover local radio, and start listening instantly.
        </p>

        <div class="mt-6 flex flex-wrap gap-2">
          <NuxtLink
            v-for="areaItem in areaItems"
            :key="areaItem.slug"
            :to="`/${areaItem.slug}`"
            class="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:-translate-y-0.5 hover:border-rose-200 hover:text-slate-950 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:border-rose-400/30 dark:hover:text-white"
          >
            <span>{{ $t(`world.${areaItem.key}.name`) }}</span>
            <span class="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] tabular-nums text-slate-400 dark:bg-white/5">
              {{ areaItem.count }}
            </span>
            <fa
              :icon="['fas', 'arrow-right']"
              class="h-3 w-3 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-rose-400"
            />
          </NuxtLink>
        </div>
      </div>

      <div class="relative mt-7 grid grid-cols-3 gap-3 border-t border-slate-200/70 pt-5 dark:border-white/10 sm:max-w-xl">
        <div>
          <p class="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            {{ totalCountries }}
          </p>
          <p class="mt-1 text-xs text-slate-400">Countries</p>
        </div>
        <div>
          <p class="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            {{ areaItems.length }}
          </p>
          <p class="mt-1 text-xs text-slate-400">Regions</p>
        </div>
        <div>
          <p class="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            24/7
          </p>
          <p class="mt-1 text-xs text-slate-400">Streaming</p>
        </div>
      </div>
    </section>

    <section>
      <div class="mb-3 flex items-center justify-between px-1">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">
            Featured
          </p>
          <h2 class="mt-1 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
            Start listening
          </h2>
        </div>
      </div>

      <Player
        country="world.asia.viet_nam"
        thumb="/img/asia/flags/viet-nam.png"
        :streamName="streamName"
        :streamUrl="streamUrl"
        :streamUrls="streamUrls"
      />
    </section>

    <section>
      <div class="mb-3 px-1">
        <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">
          Explore
        </p>
        <h2 class="mt-1 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
          Browse by country
        </h2>
      </div>
      <PanelRadio />
    </section>
  </div>
</template>

<script setup lang="ts">
import worldData from "~/data/world";
import type { RadioSource } from "~/types/radio";

const runtimeConfig = useRuntimeConfig();
const streamName = ref<string>("");
const streamUrl = ref<RadioSource>({ src: "", type: "audio/mpeg" });
const streamUrls = ref<RadioSource[]>([]);

const areaItems = computed(() =>
  Object.entries(worldData).map(([key, countries]) => ({
    key,
    slug: key.replace(/_/g, "-"),
    count: Object.keys(countries).length,
  })),
);

const totalCountries = computed(() =>
  areaItems.value.reduce((total, area) => total + area.count, 0),
);

const seoTitle = "Live Internet Radio Worldwide";
const seoDescription =
  "Listen to live internet radio from around the world. Browse stations by region and country and stream radio online with Radio ePlus.";

useHead({ title: seoTitle });
useSeoMeta({
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
});

const fetchData = async (): Promise<void> => {
  try {
    const response = await fetch(
      `/radio/asia/${runtimeConfig.public.pinChannelFavorites}.json`,
    );
    const data = await response.json();

    interface ChannelStream {
      url: string;
      type?: string;
      cros?: boolean;
    }

    interface Channel {
      favorite: boolean;
      title: string;
      stream: string;
      streams?: ChannelStream[];
      stream_alternative?: string;
      type: string;
      cros: boolean;
    }

    const favoriteChannel = Object.values(data as Record<string, Channel>).find(
      (channel) => channel.favorite,
    );

    if (!favoriteChannel) return;

    streamName.value = favoriteChannel.title;

    const seen = new Set<string>();
    const candidates = [
      {
        url: favoriteChannel.stream,
        type: favoriteChannel.type,
        cros: favoriteChannel.cros,
      },
      ...(favoriteChannel.streams || []),
      ...(favoriteChannel.stream_alternative
        ? [{ url: favoriteChannel.stream_alternative }]
        : []),
    ].filter((item) => {
      const url = String(item.url || "").trim();
      if (!/^https?:\/\//i.test(url) || seen.has(url)) return false;
      seen.add(url);
      return true;
    });

    streamUrls.value = candidates.map((item) => ({
      src: item.cros
        ? `${runtimeConfig.public.corsServer}${item.url}`
        : item.url,
      type: item.type,
    }));

    streamUrl.value =
      streamUrls.value[0] || ({ src: "", type: "audio/mpeg" } as RadioSource);
  } catch (error) {
    console.error("Error fetching featured radio:", error);
  }
};

onMounted(() => {
  void fetchData();
});
</script>
