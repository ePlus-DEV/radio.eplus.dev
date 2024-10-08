<template>
  <div>
    <div
      class="flex flex-col bg-white border shadow-sm rounded-xl pointer-events-auto dark:bg-neutral-800 dark:border-neutral-700 dark:shadow-neutral-700/70"
    >
      <div
        class="relative"
      >
        <div class="relative p-4 border-b border-gray-200 dark:border-neutral-700">
          <label
            id="html-example-using-modal-popup-with-shortcut-call-trigger-label"
            for="html-example-using-modal-popup-with-shortcut-call-trigger-input"
            class="sr-only"
            >Search input</label
          >
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
              id="html-example-using-modal-popup-with-shortcut-call-trigger-input"
              class="py-3 ps-10 pe-4 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
              type="text"
              role="combobox"
              aria-expanded="false"
              v-model="input"
              :placeholder="$t('popup.search.text')"
              data-hs-combo-box-input=""
            />
          </div>
        </div>

        <pre class="text-white">{{ result.hits }}</pre>

        <!-- SearchBox Modal Body -->
        <div
          data-hs-combo-box-output=""
          role="listbox"
          tabindex="-1"
          aria-orientation="vertical"
          class="top-full"
          style="margin-top: 5px"
        >
          <div
            class="h-80 p-2 overflow-hidden overflow-y-auto [&amp;::-webkit-scrollbar]:w-2 [&amp;::-webkit-scrollbar-thumb]:rounded-full [&amp;::-webkit-scrollbar-track]:bg-gray-100 [&amp;::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&amp;::-webkit-scrollbar-track]:bg-neutral-700 dark:[&amp;::-webkit-scrollbar-thumb]:bg-neutral-500"
            data-hs-combo-box-output-items-wrapper=""
          >
            
            <div
              class="block text-xs text-gray-500 m-3 mb-1 dark:text-neutral-500 dark:border-neutral-700 --exclude-accessibility"
              data-hs-combo-box-group-title="people"
              style="display: block"
            >
              Kết quả tìm kiếm
            </div>
            <div
              data-hs-combo-box-output-item='{"group": {"name": "people", "title": "People"}}'
              tabindex="6"
              style="display: block"
            >
              <a
                class="py-2 px-2.5 flex items-center gap-x-3 hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                href="/plugins.html"
              >
                <img
                  class="shrink-0 size-5 rounded-full"
                  src="https://images.unsplash.com/photo-1610186593977-82a3e3696e7f?ixlib=rb-4.0.3&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=320&amp;h=320&amp;q=80"
                  alt="Avatar"
                />
                <span
                  class="text-sm text-gray-800 dark:text-neutral-200"
                  data-hs-combo-box-search-text="Chris Peti"
                  data-hs-combo-box-value=""
                  >Chris Peti</span
                >
                <span
                  class="ms-auto text-xs text-gray-400 dark:text-neutral-500"
                  data-hs-combo-box-search-text="Offline"
                  data-hs-combo-box-value=""
                  >Offline</span
                >
              </a>
            </div>
            
            <div
              tabindex="5"
              style="display: block"
            >
              <a
                class="py-2 px-2.5 flex items-center gap-x-3 hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                href="/license.html"
              >
                <img
                  class="shrink-0 size-5 rounded-full"
                  src="https://radio.eplus.dev/img/asia/singapore/power.png"
                  alt="Avatar"
                />
                <span
                  class="text-sm text-gray-800 dark:text-neutral-200"
                  data-hs-combo-box-search-text="Kim Ya Sung"
                  data-hs-combo-box-value=""
                  >VOV 3</span
                >
                <span
                  class="ms-auto text-xs text-teal-600"
                  data-hs-combo-box-search-text="Online"
                  data-hs-combo-box-value=""
                  >Vietnam</span
                >
              </a>
            </div>
            <div
              data-hs-combo-box-output-item='{"group": {"name": "people", "title": "People"}}'
              tabindex="7"
              style="display: block"
            >
              <a
                class="py-2 px-2.5 flex items-center gap-x-3 hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
                href="/privacy.html"
              >
                <img
                  class="shrink-0 size-5 rounded-full"
                  src="https://radio.eplus.dev/img/asia/singapore/yes-933.png"
                  alt="Avatar"
                />
                <span
                  class="text-sm text-gray-800 dark:text-neutral-200"
                  data-hs-combo-box-search-text="Martin Azara"
                  data-hs-combo-box-value=""
                  >Power 98 Love Songs</span
                >
                <span
                  class="ms-auto text-xs text-gray-400 dark:text-neutral-500"
                  data-hs-combo-box-search-text="Offline"
                  data-hs-combo-box-value=""
                  >Singapore</span
                >
              </a>
            </div>
          </div>
        </div>
        <!-- End SearchBox Modal Body -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const config = useRuntimeConfig();
const { result, search } = useAlgoliaSearch(config.public.algoliaIndexStation);
// khi nào input thay đổi thì search
const input = ref("");
watch(input, async (value: string) => {
  await search({
    query: value,
    requestOptions: {
      hitsPerPage: 5,
    },
  });
});
</script>
