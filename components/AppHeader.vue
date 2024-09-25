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
                @click="showorhide()"
                :icon="['far', 'magnifying-glass-music']"
                class="icon icon-tabler icon-tabler-search cursor-pointer text-white w-6 h-6"
              />
              <!-- END - Button Search -->
            </div>
            <div
              class="w-20 h-full flex items-center justify-center border-l border-r border-gray-700 text-gray-400"
            >
              <button
                id="switchTheme"
                class="h-10 w-10 flex justify-center items-center focus:outline-none text-yellow-500"
                @click="darkmode()"
              >
                <fa
                  :icon="['fass', 'sun-bright']"
                  class="w-6 h-6"
                  :class="[$colorMode.value == 'light' ? 'block' : 'hidden']"
                />
                <fa
                  :icon="['fass', 'moon']"
                  class="w-6 h-6"
                  :class="[$colorMode.value == 'dark' ? 'block' : 'hidden']"
                />
              </button>
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
            id="switchTheme"
            class="h-10 w-10 flex justify-center items-center text-yellow-500"
            @click="showorhide()"
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
          <button
            id="switchTheme"
            class="h-10 w-10 flex justify-center items-center focus:outline-none text-yellow-500"
            @click="darkmode()"
          >
            <svg
              class="w-6 h-6"
              :class="[$colorMode.value == 'light' ? 'block' : 'hidden']"
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
              :class="[$colorMode.value == 'dark' ? 'block' : 'hidden']"
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
      <div class="modal-box dark:bg-gray-700">
        <p>
          <!-- BEGIN - ais-instant-search -->
          <Search />
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
const showModal = ref(false);

const toggleModal = () => {
  showModal.value = !showModal.value;
};

const darkmode = () => {
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "light") {
    localStorage.setItem("theme", "dark");
    document.documentElement.classList.add("dark");
  } else {
    localStorage.setItem("theme", "light");
    document.documentElement.classList.remove("dark");
  }
};

const showorhide = () => {
  const modalButton = document.querySelector(".modal-button") as HTMLElement;
  if (modalButton) {
    modalButton.click();
  }
};

const MenuHandler = (el: Event, val: boolean) => {
  const parentElement = (el.currentTarget as HTMLElement).parentElement;
  if (parentElement) {
    let MainList = parentElement.getElementsByTagName("ul")[0];
    let closeIcon = parentElement.getElementsByClassName("close-m-menu")[0];
    let showIcon = parentElement.getElementsByClassName("show-m-menu")[0];
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
