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
                  <fa :icon="['fas', 'signal-stream']" />
                </span>
                {{ $t("navmenu.homepage") }}
              </li>
            </nuxt-link>
            <li
              class="cursor-pointer h-full flex items-center text-sm hover:text-red-500 text-white mx-10 tracking-normal transition duration-150 ease-in-out"
            >
              <span class="mr-2">
                <fa :icon="['fad', 'snooze']" />
              </span>
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
              <!-- BEGIN - Button Search -->
              <fa
                @click="search()"
                :icon="['far', 'magnifying-glass-music']"
                class="icon icon-tabler icon-tabler-search cursor-pointer text-white w-6 h-6"
              />
              <!-- END - Button Search -->
            </div>
            <div
              class="w-20 h-full flex items-center justify-center border-l border-r border-gray-700 text-gray-400"
            >
              <ThemeDarkMode />
            </div>
            <!-- BEGIN - Language - Desktop -->
            <div class="flex items-center pl-8 relative">
              <LangSwitcher />
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
          <LangSwitcher />
          <!-- BEGIN - Toggle Language - Mobile -->
          <!-- BEGIN - Search - Mobile -->
          <button
            class="h-10 w-10 flex justify-center items-center text-yellow-500"
            @click="search()"
          >
            <!-- BEGIN - Button Search -->
            <fa
              :icon="['far', 'magnifying-glass-music']"
              class="icon icon-tabler icon-tabler-search cursor-pointer text-white w-6 h-6"
            />
            <!-- END - Button Search -->
          </button>
          <!-- END - Search - Mobile -->
          <!-- BEGIN - Dark Mode - Mobile -->
          <ThemeDarkMode />
          <!-- END - Dark Mode - Mobile -->
          <svg
            @click="menuHandler($event, true)"
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
            @click="menuHandler($event, false)"
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
      <div class="modal-box dark:bg-gray-700">
        <p>
          <!-- BEGIN - ais-instant-search -->
          <PanelSearch />
          <!-- END - ais-instant-search -->
        </p>
        <div class="modal-action">
          <label
            for="search-modal"
            class="btn btn-sm bg-red-500 hover:bg-red-700"
          >
            <fa :icon="['fas', 'xmark-large']" class="mr-2" />
            {{ $t("button.close") }}
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/**
 * Toggles the visibility of the search modal.
 */
const search = () => {
  const modalButton = document.querySelector(".modal-button") as HTMLElement;
  if (modalButton) {
    modalButton.click();
  }
};

/**
 * Handles the menu toggle functionality.
 * @param {Event} el - The event object.
 * @param {boolean} val - The value indicating whether to show or hide the menu.
 */
const menuHandler = (el: Event, val: boolean) => {
  const parentElement = (el.currentTarget as HTMLElement).parentElement;
  if (parentElement) {
    const MainList = parentElement.getElementsByTagName("ul")[0];
    const closeIcon = parentElement.getElementsByClassName("close-m-menu")[0];
    const showIcon = parentElement.getElementsByClassName("show-m-menu")[0];
    if (val) {
      MainList.classList.remove("hidden");
      (el.currentTarget as HTMLElement).classList.add("hidden");
      closeIcon.classList.remove("hidden");
    } else {
      showIcon.classList.remove("hidden");
      MainList.classList.add("hidden");
      (el.currentTarget as HTMLElement).classList.add("hidden");
    }
  }
};

onMounted(() => {
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
  }
});
</script>
