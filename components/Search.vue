<template>
  <ais-instant-search
    :search-client="searchClient"
    index-name="radio.eplus.dev"
    :future="{ preserveSharedStateOnUnmount: true }"
  >
    <ais-search-box>
      <template v-slot="{ currentRefinement, isSearchStalled, refine }">
        <div class="form-control">
          <div class="relative">
            <input
              type="search"
              :value="currentRefinement"
              @input="refine($event.currentTarget.value)"
              :placeholder="$t('popup.search.text')"
              class="w-full input input-secondary input-bordered dark:bg-gray-700 dark:text-white"
            />
            <ais-voice-search>
              <template
                v-slot="{ isBrowserSupported, isListening, toggleListening }"
              >
                <button
                  :disabled="!isBrowserSupported"
                  class="absolute top-0 right-0 rounded-l-none btn btn-secondary btn-outline"
                  @click="toggleListening"
                >
                  <fa
                    :icon="[
                      isListening ? 'fass' : 'fass',
                      isListening
                        ? 'microphone-lines-slash'
                        : 'microphone-lines',
                    ]"
                  />
                </button>
              </template>
            </ais-voice-search>
          </div>

          <!-- BEGIN - Category -->
          <ais-refinement-list attribute="station_country" :limit="1000">
            <template v-slot="{ items, refine }">
              <select
                @change="refine(selected($event.target.value))"
                class="select select-bordered select-warning w-full dark:bg-gray-700 dark:text-white mt-1"
              >
                <option value="">{{ $t("popup.search.category") }}</option>
                <option
                  v-for="item in items"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ $t(item.label) }} ({{ item.count.toLocaleString() }})
                </option>
              </select>
            </template>
          </ais-refinement-list>

          <!-- END - Category -->
        </div>

        <ais-stats class="dark:text-gray-400">
          <template v-slot="{ nbPages, nbHits, page, processingTimeMS }">
            {{
              $t("popup.search.stats", {
                page: page + 1,
                nbPages: nbPages,
                nbHits: nbHits,
                processingTimeMS: processingTimeMS,
              })
            }}
          </template>
        </ais-stats>
        <span :hidden="!isSearchStalled">Loading...</span>
      </template>
    </ais-search-box>
    <ais-configure :hits-per-page.camel="5" />
    <ais-hits>
      <template v-slot="{ items }">
        <div class="flex flex-col items-center">
          <div class="w-full flex flex-col items-center h-64">
            <div class="w-full px-4">
              <div class="flex flex-col items-center relative">
                <div
                  class="absolute shadow bg-white dark:bg-gray-700 top-100 z-40 w-full lef-0 rounded max-h-select overflow-y-auto svelte-5uyqqj"
                >
                  <div class="flex flex-col w-full">
                    <!-- item -->
                    <nuxt-link
                      :to="item.url"
                      class="cursor-pointer w-full border-gray-100 dark:border-gray-600 dark:hover:bg-base-content rounded-t border-b hover:bg-base-200"
                      v-for="item in items"
                      :key="item.objectID"
                      @click.native="showorhide"
                    >
                      <div
                        class="flex w-full items-center p-2 pl-2 border-transparent border-l-2 relative hover:border-teal-100"
                      >
                        <div class="w-8 flex flex-col items-center">
                          <div
                            class="flex relative bg-orange-500 justify-center items-center m-1 mr-2 w-10 h-6 mt-1 rounded-full"
                          >
                            <nuxt-img
                              loading="lazy"
                              :alt="item.station_name"
                              :src="item.station_image"
                            />
                          </div>
                        </div>
                        <div class="w-full items-center flex">
                          <div class="mx-2 -mt-1 truncate dark:text-white">
                            <span
                              v-html="
                                item._highlightResult?.station_name?.value ||
                                item.station_name
                              "
                            ></span>
                            <div
                              class="text-xs truncate w-full normal-case font-normal -mt-1 text-gray-500 dark:text-gray-400"
                            >
                              {{ $t(item.station_country) }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </nuxt-link>
                    <!-- item  -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </ais-hits>
    <!-- pagination -->
    <ais-pagination>
      <template
        v-slot="{
          currentRefinement,
          nbPages,
          pages,
          isFirstPage,
          isLastPage,
          refine,
        }"
      >
        <div class="btn-group">
          <button
            class="btn btn-sm"
            v-if="!isFirstPage"
            @click.prevent="refine(0)"
          >
            <fa :icon="['fasl', 'chevrons-left']" />
          </button>
          <button
            class="btn btn-sm"
            v-if="!isFirstPage"
            @click.prevent="refine(currentRefinement - 1)"
          >
            <fa :icon="['fasr', 'angle-left']" />
          </button>
          <button
            class="btn btn-sm"
            :class="page === currentRefinement ? 'btn-active' : ''"
            v-for="page in pages"
            :key="page"
            @click.prevent="refine(page)"
          >
            {{ page + 1 }}
          </button>
          <button
            class="btn btn-sm"
            v-if="!isLastPage"
            @click.prevent="refine(currentRefinement + 1)"
          >
            <fa :icon="['fasr', 'angle-right']" />
          </button>
          <button
            class="btn btn-sm"
            v-if="!isLastPage"
            @click.prevent="refine(nbPages)"
          >
            <fa :icon="['fasl', 'chevrons-right']" />
          </button>
        </div>
      </template>
    </ais-pagination>
    <!-- pagination -->
  </ais-instant-search>
</template>

<script>
import algoliasearch from "algoliasearch";
export default {
  name: "Search",
  data() {
    return {
      searchClient: algoliasearch(
        this.$config.ALGOLIA_APP_ID,
        this.$config.ALGOLIA_API_KEY,
      ),
      selectedCategory: "",
    };
  },
  methods: {
    selected(data) {
      this.selectedCategory = data || this.selectedCategory;
      return this.selectedCategory;
    },
  },
};
</script>
<style>
.btn-group > .btn-active,
.btn-group > input[type="radio"]:checked.btn {
  background-color: #f3f4f6;
  color: #1e293b;
  border-color: #d1d5db;
  box-shadow: none;
}
</style>
