<template>
  <div>
    <div
      class="flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-neutral-700/70"
    >
      <div class="relative">
        <div
          class="relative p-4 border-b border-gray-200 dark:border-neutral-700"
        >
          <label for="search-input" class="sr-only">Search input</label>
          <div class="relative">
            <div
              class="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-3.5"
            >
              <svg
                class="shrink-0 size-4 text-gray-400 dark:text-white/60"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>
            <input
              id="search-input"
              class="py-3 ps-10 pe-4 block w-full bg-slate-100 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
              type="text"
              role="combobox"
              aria-expanded="false"
              v-model="input"
              :placeholder="$t('popup.search.text')"
            />
          </div>
        </div>
        <!-- BEGIN - SearchBox Modal Body -->
        <div tabindex="-1" class="top-full mt-1">
          <div class="h-80 p-2 overflow-hidden overflow-y-auto scrollbar">
            <div
              class="block text-xs text-gray-500 m-3 mb-1 dark:text-neutral-500 dark:border-neutral-700"
            >
              <!-- Search results will be displayed here -->
              <pre class="text-white">{{ searchResult }}</pre>

              Kênh phổ biến 
            </div>
            <SearchResult :result="searchResult?.hits" />
            <div class="divider divider-neutral text-white">Trang {{ searchResult?.page + 1 }}/{{ searchResult?.nbPages }} - {{ searchResult?.nbHits }}</div>

            <div class="join">
              <button class="join-item btn btn-sm">1</button>
              <button class="join-item btn btn-sm btn-active">2</button>
              <button class="join-item btn-sm btn">3</button>
              <button class="join-item btn-sm btn">4</button>
            </div>
          </div>
        </div>
        <!-- END - SearchBox Modal Body -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const config = useRuntimeConfig();
const { search, result: searchResult } = useAlgoliaSearch(config.public.algoliaIndexStation);

const input = ref("");
let typingTimeout: ReturnType<typeof setTimeout> | null = null;

watch(input, (value: string) => {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }
  typingTimeout = setTimeout(async () => {
    await search({
      query: value,
      requestOptions: {
        hitsPerPage: 5,
      },
    });
  }, 500);
});
</script>

<style scoped>
.scrollbar::-webkit-scrollbar {
  width: 2px;
}
.scrollbar::-webkit-scrollbar-thumb {
  border-radius: 9999px;
  background-color: #d1d5db;
}
.scrollbar::-webkit-scrollbar-track {
  background-color: #f3f4f6;
}
.dark .scrollbar::-webkit-scrollbar-thumb {
  background-color: #6b7280;
}
.dark .scrollbar::-webkit-scrollbar-track {
  background-color: #374151;
}
</style>
