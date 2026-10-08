<template>
  <header class="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6">
    <nav
      class="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border border-[var(--radio-border)] bg-[color:var(--radio-surface)]/90 px-3 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:shadow-black/20 sm:px-4"
    >
      <div class="flex min-w-0 items-center gap-2">
        <NuxtLink
          to="/"
          class="group flex min-w-0 items-center gap-3 rounded-xl pr-2 focus:outline-none focus:ring-2 focus:ring-rose-400/40"
          @click="mobileOpen = false"
        >
          <span
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 shadow-md ring-1 ring-white/10 dark:bg-white"
          >
            <img
              src="/brand/logo-white.svg"
              width="30"
              height="30"
              alt="Radio ePlus"
              class="h-7 w-7 object-contain dark:brightness-0"
            />
          </span>
          <span class="hidden min-w-0 sm:block">
            <span class="block truncate text-sm font-bold tracking-tight text-slate-950 dark:text-white">
              Radio ePlus
            </span>
            <span class="block text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-500">
              Live radio
            </span>
          </span>
        </NuxtLink>

        <div class="ml-2 hidden items-center gap-1 lg:flex">
          <NuxtLink
            to="/"
            class="rounded-xl px-3 py-2 text-sm font-medium transition"
            :class="
              route.path === '/'
                ? 'bg-[var(--radio-hover)] text-[var(--radio-text)]'
                : 'text-[var(--radio-text-muted)] hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]'
            "
          >
            {{ $t("navmenu.homepage") }}
          </NuxtLink>
          <NuxtLink
            to="/statistics"
            class="rounded-xl px-3 py-2 text-sm font-medium text-[var(--radio-text-muted)] transition hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]"
          >
            {{ $t("navmenu.statistics") }}
          </NuxtLink>
        </div>
      </div>

      <div class="flex items-center gap-1">
        <button
          type="button"
          class="flex h-10 items-center gap-2 rounded-xl px-2.5 text-[var(--radio-text-muted)] transition hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)] sm:px-3"
          :aria-label="$t('popup.search.text')"
          @click="openSearch"
        >
          <fa :icon="['fas', 'magnifying-glass']" class="h-4 w-4" />
          <span class="hidden text-sm font-medium md:inline">
            {{ $t("popup.search.text") }}
          </span>
          <kbd
            class="kbd kbd-xs hidden border-[var(--radio-border)] bg-[var(--radio-surface-soft)] font-medium text-[var(--radio-text-muted)] xl:inline"
          >
            /
          </kbd>
        </button>

        <ThemeDarkMode />
        <LangSwitcher />

        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--radio-text-muted)] transition hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)] lg:hidden"
          :aria-label="mobileOpen ? $t('button.close') : 'Menu'"
          :aria-expanded="mobileOpen"
          @click="mobileOpen = !mobileOpen"
        >
          <fa :icon="['fas', mobileOpen ? 'xmark' : 'bars']" />
        </button>
      </div>
    </nav>

    <div
      v-if="mobileOpen"
      class="radio-themed-surface mx-auto mt-2 max-w-7xl rounded-2xl border border-[var(--radio-border)] p-2 shadow-xl shadow-slate-900/10 lg:hidden"
    >
      <NuxtLink
        to="/"
        class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--radio-text-muted)] hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]"
        @click="mobileOpen = false"
      >
        <fa :icon="['fas', 'house']" class="w-4 text-slate-400" />
        {{ $t("navmenu.homepage") }}
      </NuxtLink>
      <NuxtLink
        to="/statistics"
        class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
        @click="mobileOpen = false"
      >
        <fa :icon="['fas', 'chart-simple']" class="w-4 text-slate-400" />
        {{ $t("navmenu.statistics") }}
      </NuxtLink>
      <a
        href="https://old-radio.eplus.dev"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[var(--radio-text-muted)] hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]"
      >
        <fa :icon="['fas', 'clock-rotate-left']" class="w-4 text-slate-400" />
        {{ $t("navmenu.old_version") }}
      </a>
    </div>
  </header>

  <Teleport to="body">
    <div
      v-if="searchOpen"
      class="fixed inset-0 z-[100] flex items-start justify-center bg-[var(--radio-overlay)] p-3 pt-[8vh] backdrop-blur-sm sm:p-6 sm:pt-[12vh]"
      role="dialog"
      aria-modal="true"
      @click.self="closeSearch"
    >
      <div class="w-full max-w-2xl overflow-hidden rounded-3xl shadow-2xl shadow-black/30">
        <SearchBox @close="closeSearch" />
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
const route = useRoute();
const searchOpen = ref(false);
const mobileOpen = ref(false);

const openSearch = (): void => {
  searchOpen.value = true;
};

const closeSearch = (): void => {
  searchOpen.value = false;
};

const onKeydown = (event: KeyboardEvent): void => {
  if (event.key === "Escape") {
    closeSearch();
    mobileOpen.value = false;
    return;
  }

  if (
    event.key === "/" &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !(event.target instanceof HTMLInputElement) &&
    !(event.target instanceof HTMLTextAreaElement)
  ) {
    event.preventDefault();
    openSearch();
  }
};

watch(searchOpen, (open) => {
  if (!import.meta.client) return;
  document.body.style.overflow = open ? "hidden" : "";
});

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false;
    searchOpen.value = false;
  },
);

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});
</script>
