<template>
  <nav class="w-full bg-gray-800 shadow sticky top-0 z-50">
    <div
      class="container px-6 h-16 flex justify-between items-center lg:items-stretch mx-auto"
    >
      <div class="flex items-center">
        <div class="mr-10 flex items-center">
          <nuxt-link to="/">
            <img src="/brand/logo-white.svg" width="43" alt="Radio.ePlus.DEV" />
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
          <!-- <li
            class="cursor-pointer h-full flex items-center text-sm hover:text-red-500 text-white mx-10 tracking-normal transition duration-150 ease-in-out"
          >
            <span class="mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon icon-tabler icon-tabler-puzzle"
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
                <path
                  d="M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1"
                />
              </svg>
            </span>
            Products
          </li>
          <li
            class="cursor-pointer h-full flex items-center text-sm hover:text-red-500 text-white mr-10 tracking-normal transition duration-150 ease-in-out"
          >
            <span class="mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon icon-tabler icon-tabler-compass"
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
                <polyline points="8 16 10 10 16 8 14 14 8 16" />
                <circle cx="12" cy="12" r="9" />
              </svg>
            </span>
            Performance
          </li>
          <li
            class="cursor-pointer h-full flex items-center text-sm hover:text-red-500 text-white tracking-normal transition duration-150 ease-in-out"
          >
            <span class="mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon icon-tabler icon-tabler-code"
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
                <polyline points="7 8 3 12 7 16" />
                <polyline points="17 8 21 12 17 16" />
                <line x1="14" y1="4" x2="10" y2="20" />
              </svg>
            </span>
            Deliverables
          </li> -->
        </ul>
      </div>
      <div class="h-full hidden xl:flex items-center justify-end">
        <div class="h-full flex">
          <div
            class="px-6 h-full justify-center border-l border-gray-700 text-gray-400 flex items-center"
          >
            <input
              type="text"
              class="bg-transparent focus:outline-none text-xs w-0 transition duration-150 ease-in-out"
              placeholder="Type something..."
            />
            <svg
              @click="searchHandler($event)"
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
          <!-- <div
            class="w-20 h-full flex items-center justify-center border-l border-r border-gray-700 text-gray-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="icon icon-tabler icon-tabler-messages cursor-pointer"
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
              <path
                d="M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10"
              />
              <path d="M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2" />
            </svg>
          </div> -->
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
          </div>
          <div class="flex items-center pl-8 relative cursor-pointer">
            <ul
              class="p-2 w-40 border-r bg-white absolute rounded left-0 shadow mt-16 top-0 hidden"
            >
              <li
                class="cursor-pointer text-gray-600 text-sm leading-3 tracking-normal py-2 hover:text-indigo-700 focus:text-indigo-700 focus:outline-none"
                v-for="locale in availableLocales"
                :key="locale.code"
                @click.prevent.stop="
                  $i18n.setLocale(locale.code), $moment.locale(locale.code)
                "
              >
                {{ $t("navmenu.language") }} {{ locale.name }}
              </li>
            </ul>

            <template v-for="(locale, index) in availableLocales">
              <img
                class="rounded h-10 w-10 object-cover"
                :src="locale.flag"
                :alt="locale.name"
                @click.prevent.stop="
                  $i18n.setLocale(locale.code), $moment.locale(locale.code)
                "
                :key="index"
              />
              <p
                class="text-white text-sm ml-2"
                @click.prevent.stop="
                  $i18n.setLocale(locale.code), $moment.locale(locale.code)
                "
                :key="index"
              >
                {{ locale.name }}
              </p>
            </template>
            <!-- <p
              class="text-white text-sm ml-2"
              v-for="locale in availableLocales"
              :key="locale.code"
              @click.prevent.stop="
                $i18n.setLocale(locale.code), $moment.locale(locale.code)
              "
            >
              {{ $t("navmenu.language") }} {{ locale.name }}
            </p> -->
          </div>
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
        </ul>
        <!-- BEGIN - Toggle Language - Mobile -->
        <template v-for="(locale, index) in availableLocales">
          <img
            class="rounded h-8 w-12 object-cover"
            :src="locale.flag"
            :alt="locale.name"
            @click.prevent.stop="
              $i18n.setLocale(locale.code), $moment.locale(locale.code)
            "
            :key="index"
          />
        </template>
        <!-- BEGIN - Toggle Language - Mobile -->
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
</template>

<script>
export default {
  name: "BlackLeftAlignedWithIcons",
  data() {
    return {};
  },
  watch: {
    $route() {
      this.$colorMode.value = localStorage.theme;
    },
  },
  computed: {
    availableLocales() {
      return this.$i18n.locales.filter((i) => i.code !== this.$i18n.locale);
    },
  },
  methods: {
    darkmode() {
      if (this.$colorMode.value === "light") {
        this.$colorMode.value = "dark";
        localStorage.setItem("theme", "dark");
        $("html").addClass("bg-gray-800").removeClass("bg-gray-200");
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
      let MainList = el.currentTarget.parentElement.getElementsByTagName("ul")[0];
      let closeIcon = el.currentTarget.parentElement.getElementsByClassName(
        "close-m-menu"
      )[0];
      let showIcon = el.currentTarget.parentElement.getElementsByClassName(
        "show-m-menu"
      )[0];
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
    searchHandler(event) {
      let Input = event.currentTarget.parentElement.getElementsByTagName("input")[0];
      Input.classList.toggle("w-0");
      Input.classList.toggle("w-24");
    },
  },
  created() {
    if (localStorage.getItem("theme") === null) {
      localStorage.setItem("theme", "light");
    } else if (localStorage.getItem("theme") === "dark") {
      this.$colorMode.value = localStorage.theme;
      $("html").addClass("bg-gray-800").removeClass("bg-gray-200");
    }
  },
};
</script>
