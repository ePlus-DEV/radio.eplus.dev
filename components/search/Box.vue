<template>
  <div class="radio-themed-surface overflow-hidden rounded-3xl border border-[var(--radio-border)]">
    <div class="border-b border-[var(--radio-border)] p-4 sm:p-5">
      <div class="flex items-center gap-3">
        <div class="relative min-w-0 flex-1">
          <fa
            :icon="['fas', 'magnifying-glass']"
            class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <UInput
            ref="inputEl"
            id="search-input"
            v-model="input"
            type="search"
            :aria-label="$t('popup.search.text')"
            class="w-full"
            :ui="{ base: 'h-12 rounded-2xl pl-11 pr-4 text-sm' }"
            :placeholder="$t('popup.search.text')"
          />
        </div>
        <button
          type="button"
          class="inline-flex items-center justify-center h-10 min-h-10 w-10 shrink-0 rounded-xl border-0 text-slate-400 shadow-none hover:bg-[var(--radio-surface-soft)] hover:text-[var(--radio-text)]"
          :aria-label="$t('button.close')"
          @click="$emit('close')"
        >
          <fa :icon="['fas', 'xmark']" />
        </button>
      </div>

      <p v-if="usingLocal && localLoading" class="mt-3 text-xs leading-5 text-[var(--radio-text-muted)]" role="status">
        {{ $t('panel.updating') }}
      </p>
      <p v-else-if="usingLocal && localError" class="mt-3 text-xs leading-5 text-[var(--radio-text-muted)]" role="status">
        {{ $t('search.unavailable') }}
      </p>
    </div>

    <div class="radio-scrollbar max-h-[65vh] overflow-y-auto p-3 sm:p-4">
      <div class="mb-2 flex items-center justify-between px-2">
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          {{ input ? $t("popup.search.text") : $t("popup.search.popular_channels") }}
        </span>
        <span
          v-if="displayHits.length"
          class="text-xs tabular-nums text-slate-400"
        >
          {{ displayHits.length }}
        </span>
      </div>
      <SearchResult :result="displayHits" @select="$emit('close')" />
      <p v-if="!localLoading && !localError && !displayHits.length"
        class="px-3 py-8 text-center text-sm text-[var(--radio-text-muted)]" role="status">
        {{ $t('panel.no_channels') }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { searchLocalStations } from "~/utils/station-search.mjs";

defineEmits<{
  (event: "close"): void;
}>();

const config = useRuntimeConfig();
const algoliaConfigured = computed(() => Boolean(config.public.algoliaConfigured));
const { search, result: searchResult } = useAlgoliaSearch(
  config.public.algoliaIndexStation,
);

interface StationSearchItem {
  objectID: string;
  station_name: string;
  station_country: string;
  country_label?: string;
  station_image: string;
  url: string;
  featured?: boolean;
}
const input = ref("");
const inputEl = useTemplateRef("inputEl");
const localIndex = ref<StationSearchItem[]>([]);
const localLoading = ref(true);
const localError = ref(false);
const algoliaFailed = ref(false);
const usingLocal = computed(() => !algoliaConfigured.value || algoliaFailed.value || !input.value.trim());
const displayHits = computed(() =>
  usingLocal.value
    ? searchLocalStations(localIndex.value, input.value)
    : (searchResult.value?.hits || [])
);
let typingTimeout: ReturnType<typeof setTimeout> | null = null;

const loadLocalIndex = async () => {
  try {
    const items = await $fetch<StationSearchItem[]>("/search/stations.json", { timeout: 10_000 });
    if (!Array.isArray(items)) throw new Error("Invalid station search index");
    localIndex.value = items;
  } catch (error) {
    localError.value = true;
    console.error("Unable to load local radio catalog:", error);
  } finally {
    localLoading.value = false;
  }
};

watch(input, (value: string) => {
  if (typingTimeout) clearTimeout(typingTimeout);
  if (!algoliaConfigured.value || algoliaFailed.value || !value.trim()) return;
  typingTimeout = setTimeout(async () => {
    try {
      await search({ query: value, requestOptions: { hitsPerPage: 20 } });
    } catch {
      // Do not strand the search modal when a third-party service is down.
      algoliaFailed.value = true;
    }
  }, 250);
});

onMounted(() => {
  void loadLocalIndex();
  window.setTimeout(() => inputEl.value?.inputRef?.focus(), 50);
});

onBeforeUnmount(() => {
  if (typingTimeout) clearTimeout(typingTimeout);
});
</script>

