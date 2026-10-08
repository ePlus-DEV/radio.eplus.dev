<template>
  <div class="space-y-6">
    <Breadcrumbs :area="area" level_1="" :level_2="$t(i18n)" />

    <section
      class="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white px-5 py-7 shadow-sm shadow-slate-200/40 dark:border-white/10 dark:bg-slate-900 dark:shadow-none sm:px-8"
    >
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(244,63,94,0.10),transparent_42%)]"></div>
      <div class="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-500">
            {{ $t("panel.country") }}
          </p>
          <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            {{ areaName }}
          </h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {{ seoDescription }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold tabular-nums text-slate-600 dark:bg-white/5 dark:text-slate-300">
            {{ countryCount }} countries
          </span>
        </div>
      </div>
    </section>

    <PanelRadio :chooseTheArea="area.replace('-', '_')" />
  </div>
</template>

<script setup lang="ts">
import worldData from "~/data/world";

const { t } = useI18n();
const route = useRoute();
const area = computed(() => String(route.params.area || ""));
const areaKey = computed(() => area.value.replace(/-/g, "_"));
const i18n = computed(() => `world.${areaKey.value}.name`);
const areaName = computed(() => t(i18n.value));
const areaCountries = computed(
  () =>
    (worldData as Record<string, Record<string, unknown>>)[areaKey.value] || {},
);
const countryCount = computed(() => Object.keys(areaCountries.value).length);

const seoTitle = computed(() => `Live Radio in ${areaName.value}`);
const seoDescription = computed(
  () =>
    `Browse and listen to live internet radio stations across ${areaName.value} on Radio ePlus.`,
);

useHead(() => ({ title: seoTitle.value }));
useSeoMeta(() => ({
  description: seoDescription.value,
  ogTitle: seoTitle.value,
  ogDescription: seoDescription.value,
  twitterTitle: seoTitle.value,
  twitterDescription: seoDescription.value,
}));
</script>
