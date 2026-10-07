<template>
  <div class="overflow-hidden rounded-3xl bg-white dark:bg-slate-900">
    <div class="border-b border-slate-200 p-4 dark:border-white/10 sm:p-5">
      <div class="flex items-center gap-3">
        <div class="relative min-w-0 flex-1">
          <fa
            :icon="['fas', 'magnifying-glass']"
            class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            ref="inputEl"
            id="search-input"
            v-model="input"
            type="search"
            role="combobox"
            aria-expanded="true"
            class="block h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
            :placeholder="$t('popup.search.text')"
          />
        </div>
        <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
          :aria-label="$t('button.close')"
          @click="$emit('close')"
        >
          <fa :icon="['fas', 'xmark']" />
        </button>
      </div>

      <p
        v-if="!algoliaConfigured"
        class="mt-3 text-xs leading-5 text-slate-400"
      >
        Search service is unavailable right now. Popular stations are still shown below.
      </p>
    </div>

    <div class="max-h-[65vh] overflow-y-auto p-3 sm:p-4">
      <div class="mb-2 flex items-center justify-between px-2">
        <span class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          {{ input ? $t("popup.search.text") : $t("popup.search.popular_channels") }}
        </span>
        <span
          v-if="searchResult?.hits?.length"
          class="text-xs tabular-nums text-slate-400"
        >
          {{ searchResult.hits.length }}
        </span>
      </div>
      <SearchResult
        :result="searchResult?.hits"
        @select="$emit('close')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineEmits<{
  (event: "close"): void;
}>();

const config = useRuntimeConfig();
const algoliaConfigured = computed(() => Boolean(config.public.algoliaConfigured));
const { search, result: searchResult } = useAlgoliaSearch(
  config.public.algoliaIndexStation,
);

const input = ref("");
const inputEl = ref<HTMLInputElement | null>(null);
let typingTimeout: ReturnType<typeof setTimeout> | null = null;

watch(input, (value: string) => {
  if (typingTimeout) clearTimeout(typingTimeout);
  if (!algoliaConfigured.value) return;

  typingTimeout = setTimeout(async () => {
    try {
      await search({
        query: value,
        requestOptions: {
          hitsPerPage: 20,
        },
      });
    } catch (error) {
      console.error("Unable to search stations:", error);
    }
  }, 250);
});

onMounted(() => {
  window.setTimeout(() => inputEl.value?.focus(), 50);
});

onBeforeUnmount(() => {
  if (typingTimeout) clearTimeout(typingTimeout);
});
</script>
