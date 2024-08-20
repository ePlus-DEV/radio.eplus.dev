<template>
  <div>
    <nav class="w-full bg-gray-800 shadow fixed top-0 z-50">
      <div
        class="container px-6 h-16 flex justify-between items-center lg:items-stretch mx-auto"
      >
        <div class="flex items-center">
          <div class="mr-10 flex items-center">
            <nuxt-link to="/">
              <img
                loading="lazy"
                src="/brand/logo-white.svg"
                width="43"
                alt="Radio.ePlus.DEV"
              />
            </nuxt-link>
            <h3
              class="text-base text-white font-bold tracking-normal leading-tight ml-3 hidden lg:block"
            >
              <nuxt-link to="/">Radio.ePlus.DEV</nuxt-link>
            </h3>
          </div>
          <ul class="hidden xl:flex items-center h-full">
            <nuxt-link to="/">
              <li
                class="cursor-pointer h-full flex items-center text-sm text-red-500 tracking-normal transition duration-150 ease-in-out"
              >
                <span class="mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon icon-tabler icon-tabler-grid"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" />
                    <rect x="4" y="4" width="6" height="6" rx="1" />
                    <rect x="14" y="4" width="6" height="6" rx="1" />
                    <rect x="4" y="14" width="6" height="6" rx="1" />
                    <rect x="14" y="14" width="6" height="6" rx="1" />
                  </svg>
                </span>
                {{ $t("navmenu.homepage") }}
              </li>
            </nuxt-link>
            <li
              class="cursor-pointer h-full flex items-center text-sm hover:text-red-500 text-white mx-10 tracking-normal transition duration-150 ease-in-out"
            >
              <span class="mr-2"> </span>
              <a
                href="https://old-radio.eplus.dev"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ $t("navmenu.old_version") }}
              </a>
            </li>
          </ul>
        </div>
        <div class="h-full hidden xl:flex items-center justify-end">
          <div class="h-full flex">
            <div
              class="px-6 h-full justify-center border-l border-gray-700 text-gray-400 flex items-center"
            >
              <svg
                @click="showorhide()"
                xmlns="http://www.w3.org/2000/svg"
                class="icon icon-tabler icon-tabler-search cursor-pointer"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" />
                <circle cx="10" cy="10" r="7" />
                <line x1="21" y1="21" x2="15" y2="15" />
              </svg>
            </div>
            <div
              class="w-20 h-full flex items-center justify-center border-l border-r border-gray-700 text-gray-400"
            >
              <button
                id="switchTheme"
                class="h-10 w-10 flex justify-center items-center focus:outline-none text-yellow-500"
                @click="darkmode()"
              >
                <svg
                  class="w-6 h-6"
                  :class="[
                    this.$colorMode.value == 'light' ? 'block' : 'hidden',
                  ]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <svg
                  class="w-6 h-6"
                  fill="currentColor"
                  :class="[
                    this.$colorMode.value == 'dark' ? 'block' : 'hidden',
                  ]"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M9.353 2.939a1 1 0 01.22 1.08 8 8 0 0010.408 10.408 1 1 0 011.301 1.3A10.003 10.003 0 0112 22C6.477 22 2 17.523 2 12c0-4.207 2.598-7.805 6.273-9.282a1 1 0 011.08.22z"
                  ></path>
                </svg>
              </button>
            </div>
            <!-- BEGIN - Language - Desktop -->
            <div class="flex items-center pl-8 relative">
              <div class="dropdown dropdown-end">
                <label
                  tabindex="0"
                  class="flex flex-row items-center gap-1 normal-case"
                >
                  <svg
                    class="inline-block h-8 w-8 fill-current text-white cursor-pointer"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 512 512"
                  >
                    <path
                      d="M363,176,246,464h47.24l24.49-58h90.54l24.49,58H480ZM336.31,362,363,279.85,389.69,362Z"
                    ></path>
                    <path
                      d="M272,320c-.25-.19-20.59-15.77-45.42-42.67,39.58-53.64,62-114.61,71.15-143.33H352V90H214V48H170V90H32v44H251.25c-9.52,26.95-27.05,69.5-53.79,108.36-32.68-43.44-47.14-75.88-47.33-76.22L143,152l-38,22,6.87,13.86c.89,1.56,17.19,37.9,54.71,86.57.92,1.21,1.85,2.39,2.78,3.57-49.72,56.86-89.15,79.09-89.66,79.47L64,368l23,36,19.3-11.47c2.2-1.67,41.33-24,92-80.78,24.52,26.28,43.22,40.83,44.3,41.67L255,362Z"
                    ></path>
                  </svg>
                  <svg
                    width="12px"
                    height="12px"
                    class="ml-1 h-3 w-3 fill-current text-white cursor-pointer"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 2048 2048"
                  >
                    <path
                      d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"
                    ></path>
                  </svg>
                </label>
                <ul
                  tabindex="0"
                  class="menu dropdown-content p-2 shadow bg-base-100 dark:bg-gray-800 dark:text-white rounded-box w-52 mt-2 gap-1"
                >
                  <li
                    class="flex flex-row items-center dropdown-hover"
                    :class="
                      $i18n.locale === locale.code
                        ? 'bg-red-600 opacity-75 text-white p-1 rounded'
                        : 'cursor-pointer'
                    "
                    v-for="locale in $i18n.locales"
                    :key="locale.code"
                    @click="changeLanguage(locale.code)"
                  >
                    <nuxt-img
                      loading="lazy"
                      class="rounded h-8 w-12 object-cover pr-1"
                      :src="$config.Base_URL + locale.flag"
                      :alt="locale.name"
                      @click="changeLanguage(locale.code)"
                    />
                    {{ locale.name }}
                  </li>
                </ul>
              </div>
            </div>
            <!-- END - Language - Desktop -->
          </div>
        </div>
        <div class="flex items-center xl:hidden">
          <ul
            class="p-2 border-r bg-white absolute rounded top-0 left-0 right-0 shadow mt-16 md:mt-16 hidden"
          >
            <li
              class="flex md:hidden cursor-pointer text-gray-600 text-sm leading-3 tracking-normal mt-2 py-2 hover:text-indigo-700 focus:text-indigo-700 focus:outline-none"
            >
              <div class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="icon icon-tabler icon-tabler-grid"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z"></path>
                  <rect x="4" y="4" width="6" height="6" rx="1"></rect>
                  <rect x="14" y="4" width="6" height="6" rx="1"></rect>
                  <rect x="4" y="14" width="6" height="6" rx="1"></rect>
                  <rect x="14" y="14" width="6" height="6" rx="1"></rect>
                </svg>
                <span class="ml-2 font-bold">{{ $t("navmenu.homepage") }}</span>
              </div>
            </li>
            <li
              class="flex md:hidden cursor-pointer text-gray-600 text-sm leading-3 tracking-normal mt-2 py-2 hover:text-indigo-700 focus:text-indigo-700 focus:outline-none"
            >
              <span class="mr-2"> </span>
              <a
                class="ml-2 font-bold"
                href="https://old-radio.eplus.dev"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ $t("navmenu.old_version") }}
              </a>
            </li>
          </ul>
          <!-- BEGIN - Toggle Language - Mobile -->
          <div class="dropdown dropdown-end">
            <label
              tabindex="0"
              class="flex flex-row items-center gap-1 normal-case"
            >
              <svg
                class="inline-block h-8 w-8 fill-current text-white cursor-pointer"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 512 512"
              >
                <path
                  d="M363,176,246,464h47.24l24.49-58h90.54l24.49,58H480ZM336.31,362,363,279.85,389.69,362Z"
                ></path>
                <path
                  d="M272,320c-.25-.19-20.59-15.77-45.42-42.67,39.58-53.64,62-114.61,71.15-143.33H352V90H214V48H170V90H32v44H251.25c-9.52,26.95-27.05,69.5-53.79,108.36-32.68-43.44-47.14-75.88-47.33-76.22L143,152l-38,22,6.87,13.86c.89,1.56,17.19,37.9,54.71,86.57.92,1.21,1.85,2.39,2.78,3.57-49.72,56.86-89.15,79.09-89.66,79.47L64,368l23,36,19.3-11.47c2.2-1.67,41.33-24,92-80.78,24.52,26.28,43.22,40.83,44.3,41.67L255,362Z"
                ></path>
              </svg>
              <svg
                width="12px"
                height="12px"
                class="ml-1 h-3 w-3 fill-current text-white cursor-pointer"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 2048 2048"
              >
                <path
                  d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"
                ></path>
              </svg>
            </label>
            <ul
              tabindex="0"
              class="menu dropdown-content p-2 shadow bg-base-100 dark:bg-gray-800 dark:text-white rounded-box w-52 mt-2 gap-1"
            >
              <li
                class="flex flex-row items-center dropdown-hover"
                :class="
                  $i18n.locale === locale.code
                    ? 'bg-red-600 opacity-75 text-white p-1 rounded'
                    : 'cursor-pointer'
                "
                v-for="locale in $i18n.locales"
                :key="locale.code"
                @click="changeLanguage(locale.code)"
              >
                <nuxt-img
                  loading="lazy"
                  class="rounded h-8 w-12 object-cover pr-1"
                  :src="$config.Base_URL + locale.flag"
                  :alt="locale.name"
                  @click="changeLanguage(locale.code)"
                />
                {{ locale.name }}
              </li>
            </ul>
          </div>
          <!-- BEGIN - Toggle Language - Mobile -->
          <!-- BEGIN - Search - Mobile -->
          <button
            id="switchTheme"
            class="h-10 w-10 flex justify-center items-center"
            @click="showorhide()"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="icon icon-tabler icon-tabler-search cursor-pointer"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="#fff"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" />
              <circle cx="10" cy="10" r="7" />
              <line x1="21" y1="21" x2="15" y2="15" />
            </svg>
          </button>
          <!-- BEGIN - Search - Mobile -->
          <!-- BEGIN - Dark Mode - Mobile -->
          <button
            id="switchTheme"
            class="h-10 w-10 flex justify-center items-center focus:outline-none text-yellow-500"
            @click="darkmode()"
          >
            <svg
              class="w-6 h-6"
              :class="[this.$colorMode.value == 'light' ? 'block' : 'hidden']"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <svg
              class="w-6 h-6"
              fill="currentColor"
              :class="[this.$colorMode.value == 'dark' ? 'block' : 'hidden']"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M9.353 2.939a1 1 0 01.22 1.08 8 8 0 0010.408 10.408 1 1 0 011.301 1.3A10.003 10.003 0 0112 22C6.477 22 2 17.523 2 12c0-4.207 2.598-7.805 6.273-9.282a1 1 0 011.08.22z"
              ></path>
            </svg>
          </button>
          <!-- END - Dark Mode - Mobile -->
          <svg
            @click="MenuHandler($event, true)"
            aria-haspopup="true"
            aria-label="Main Menu"
            xmlns="http://www.w3.org/2000/svg"
            class="visible xl:hidden icon icon-tabler text-white icon-tabler-menu show-m-menu"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" />
            <line x1="4" y1="8" x2="20" y2="8" />
            <line x1="4" y1="16" x2="20" y2="16" />
          </svg>
          <div
            @click="MenuHandler($event, false)"
            class="hidden text-white close-m-menu p-1"
          >
            <svg
              aria-label="Close"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" />
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        </div>
      </div>
    </nav>
    <label for="search-modal" class="modal-button"></label>
    <input type="checkbox" id="search-modal" class="modal-toggle" />
    <div class="modal">
      <div class="modal-box">
        <p>
          <!-- BEGIN - ais-instant-search -->
          <ais-instant-search
            :search-client="searchClient"
            index-name="radio.eplus.dev"
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
                      class="w-full input input-primary input-bordered"
                    />
                  </div>
                </div>
                <ais-stats>
                  <template
                    v-slot="{ nbPages, nbHits, page, processingTimeMS }"
                  >
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
                          class="absolute shadow bg-white top-100 z-40 w-full lef-0 rounded max-h-select overflow-y-auto svelte-5uyqqj"
                        >
                          <div class="flex flex-col w-full">
                            <!-- item -->
                            <nuxt-link
                              :to="item.url"
                              class="cursor-pointer w-full border-gray-100 rounded-t border-b hover:bg-teal-100"
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
                                  <div class="mx-2 -mt-1 truncate">
                                    {{ item.station_name }}
                                    <div
                                      class="text-xs truncate w-full normal-case font-normal -mt-1 text-gray-500"
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
                    ‹‹
                  </button>
                  <button
                    class="btn btn-sm"
                    v-if="!isFirstPage"
                    @click.prevent="refine(currentRefinement - 1)"
                  >
                    ‹
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
                    ›
                  </button>
                  <button
                    class="btn btn-sm"
                    v-if="!isLastPage"
                    @click.prevent="refine(nbPages)"
                  >
                    ››
                  </button>
                </div>
              </template>
            </ais-pagination>
            <!-- pagination -->
          </ais-instant-search>
          <!-- END - ais-instant-search -->
        </p>
        <div class="modal-action">
          <label
            for="search-modal"
            class="btn btn-sm bg-red-500 hover:bg-red-700"
          >
            {{ $t("button.close") }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import algoliasearch from "algoliasearch";

export default {
  data() {
    return {
      searchClient: algoliasearch(
        "N87NFQVY0Z",
        "73e93ee2ef3aa6919b7c6495767c7f9d",
      ),
    };
  },
  watch: {
    $route() {
      this.$colorMode.value = localStorage.theme;
    },
  },
  methods: {
    changeLanguage(code) {
      if (this.$i18n.locale !== code) {
        this.$i18n.setLocale(code);
        this.$moment.locale(code);
      }
    },
    darkmode() {
      if (this.$colorMode.value === "light") {
        this.$colorMode.value = "dark";
        localStorage.setItem("theme", "dark");
        $("html").addClass("bg-gray-800").removeClass("bg-gray-200");
        $(".plyr__controls").css({ background: "#111827 !important" });
      } else {
        this.$colorMode.value = "light";
        localStorage.setItem("theme", "light");
        $("html").addClass("bg-gray-200").removeClass("bg-gray-800");
      }
    },
    dropdownHandler(event) {
      let single = event.currentTarget.getElementsByTagName("ul")[0];
      single.classList.toggle("hidden");
    },
    MenuHandler(el, val) {
      let MainList =
        el.currentTarget.parentElement.getElementsByTagName("ul")[0];
      let closeIcon =
        el.currentTarget.parentElement.getElementsByClassName(
          "close-m-menu",
        )[0];
      let showIcon =
        el.currentTarget.parentElement.getElementsByClassName("show-m-menu")[0];
      if (val) {
        MainList.classList.remove("hidden");
        el.currentTarget.classList.add("hidden");
        closeIcon.classList.remove("hidden");
      } else {
        showIcon.classList.remove("hidden");
        MainList.classList.add("hidden");
        el.currentTarget.classList.add("hidden");
      }
    },
    showorhide() {
      $(".modal-button").click();
    },
  },
  created() {
    if (localStorage.getItem("theme") === null) {
      localStorage.setItem("theme", "light");
    } else if (localStorage.getItem("theme") === "dark") {
      this.$colorMode.value = localStorage.theme;
      $("html").addClass("bg-gray-800").removeClass("bg-gray-200");
      $(".plyr__controls").css({ background: "#111827 !important" });
    }
  },
};
</script>
