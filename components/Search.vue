<template>
  <!-- skipcq: JS-0717 -->
  <ais-instant-search :search-client="searchClient" :index-name="'radio.eplus.dev'">
    <ais-search-box>
      <template v-slot="{ currentRefinement, isSearchStalled, refine }">
        <div class="form-control">
          <div class="relative">
            <input type="search" :value="currentRefinement" @input="refine($event.currentTarget.value)"
              :placeholder="$t('popup.search.text')" class="w-full input input-primary input-bordered" />
          </div>
        </div>
        <ais-stats>
          <template v-slot="{ nbPages, nbHits, page, processingTimeMS }">
            {{ $t("popup.search.stats", { page: page + 1, nbPages: nbPages, nbHits: nbHits, processingTimeMS:
            processingTimeMS, }) }}
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
                  class="absolute shadow bg-white top-100 z-40 w-full lef-0 rounded max-h-select overflow-y-auto svelte-5uyqqj">
                  <div class="flex flex-col w-full">
                    <!-- item -->
                    <nuxt-link :to="item.url"
                      class="cursor-pointer w-full border-gray-100 rounded-t border-b hover:bg-teal-100"
                      v-for="item in items" :key="item.objectID" @click.native="showorhide">
                      <div
                        class="flex w-full items-center p-2 pl-2 border-transparent border-l-2 relative hover:border-teal-100">
                        <div class="w-8 flex flex-col items-center">
                          <div
                            class="flex relative bg-orange-500 justify-center items-center m-1 mr-2 w-10 h-6 mt-1 rounded-full">
                            <nuxt-img loading="lazy" :alt="item.station_name" :src="item.station_image" />
                          </div>
                        </div>
                        <div class="w-full items-center flex">
                          <div class="mx-2 -mt-1 truncate">
                            {{ item.station_name }}
                            <div class="text-xs truncate w-full normal-case font-normal -mt-1 text-gray-500">
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
      <template v-slot="{
        currentRefinement,
        nbPages,
        pages,
        isFirstPage,
        isLastPage,
        refine,
      }">
        <div class="btn-group">
          <button class="btn btn-sm" v-if="!isFirstPage" @click.prevent="refine(0)">
            <fa :icon="['fasl', 'chevrons-left']" />
          </button>
          <button class="btn btn-sm" v-if="!isFirstPage" @click.prevent="refine(currentRefinement - 1)">
            <fa :icon="['fasr', 'angle-left']" />
          </button>
          <button class="btn btn-sm" :class="page === currentRefinement ? 'btn-active' : ''" v-for="page in pages"
            :key="page" @click.prevent="refine(page)">
            {{ page + 1 }}
          </button>
          <button class="btn btn-sm" v-if="!isLastPage" @click.prevent="refine(currentRefinement + 1)">
            <fa :icon="['fasr', 'angle-right']" />
          </button>
          <button class="btn btn-sm" v-if="!isLastPage" @click.prevent="refine(nbPages)">
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
        "N87NFQVY0Z",
        "73e93ee2ef3aa6919b7c6495767c7f9d",
      ),
    };
  }
};
</script>
