<template>
  <header class="fixed inset-x-0 top-0 z-50 px-3 pt-2 sm:px-6 sm:pt-3">
    <nav
      class="mx-auto flex h-14 max-w-[1920px] items-center justify-between rounded-2xl border border-[var(--radio-border)] bg-[var(--radio-header-bg)] px-2.5 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:shadow-black/20 sm:h-16 sm:px-4"
    >
      <div class="flex min-w-0 items-center gap-2">
        <NuxtLink
          to="/"
          class="group flex min-w-0 items-center gap-3 rounded-xl pr-2 focus:outline-none focus:ring-2 focus:ring-rose-400/40"
          @click="mobileOpen = false"
        >
          <span
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--radio-inverse-bg)] shadow-md ring-1 ring-[var(--radio-border)]"
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
            <span class="block truncate text-sm font-bold tracking-tight text-[var(--radio-text)]">
              Radio ePlus
            </span>
            <span class="block text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-500">
              {{ $t('brand.live_radio') }}
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
            class="rounded-xl px-3 py-2 text-sm font-medium transition"
            :class="
              route.path === '/statistics'
                ? 'bg-[var(--radio-hover)] text-[var(--radio-text)]'
                : 'text-[var(--radio-text-muted)] hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]'
            "
          >
            {{ $t("navmenu.statistics") }}
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="rounded-xl px-3 py-2 text-sm font-medium transition"
            :class="
              route.path === '/about'
                ? 'bg-[var(--radio-hover)] text-[var(--radio-text)]'
                : 'text-[var(--radio-text-muted)] hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]'
            "
          >
            {{ $t("navmenu.about") }}
          </NuxtLink>
        </div>
      </div>

      <div class="flex items-center gap-1">
        <button
          type="button"
          class="flex h-11 min-w-11 items-center gap-2 rounded-xl px-2.5 text-[var(--radio-text-muted)] transition hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)] sm:px-3"
          :aria-label="$t('popup.search.text')"
          @click="openSearch"
        >
          <fa :icon="['fas', 'magnifying-glass']" class="h-4 w-4" />
          <span class="hidden text-sm font-medium md:inline">
            {{ $t("popup.search.text") }}
          </span>
          <kbd
            class="rounded border px-1.5 py-0.5 text-[10px] hidden border-[var(--radio-border)] bg-[var(--radio-surface-soft)] font-medium text-[var(--radio-text-muted)] xl:inline"
          >
            /
          </kbd>
        </button>

        <ThemeDarkMode />
        <LangSwitcher />

        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--radio-text-muted)] transition hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)] lg:hidden"
          :aria-label="mobileOpen ? $t('button.close') : 'Menu'"
          :aria-expanded="mobileOpen"
          @click="mobileOpen = !mobileOpen"
        >
          <fa :icon="['fas', mobileOpen ? 'xmark' : 'bars']" />
        </button>
      </div>
    </nav>

  </header>
  <USlideover v-model:open="mobileOpen" side="left" :title="$t('player.explore')" :ui="{ content: 'w-80', body: 'p-3 sm:p-3' }">
    <template #body><AppSidebar mobile /></template>
  </USlideover>
  <UModal v-model:open="searchOpen" :title="$t('popup.search.text')" :description="$t('popup.search.popular_channels')" :ui="{ content: 'max-w-2xl' }">
    <template #content><SearchBox @close="closeSearch" /></template>
  </UModal>
</template>

<script lang="ts" setup>
const route = useRoute();
const searchOpen = ref(false);
const mobileOpen = ref(false);

const openSearch = (): void => {
  mobileOpen.value = false;
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
    !(event.target instanceof HTMLTextAreaElement) &&
    !(event.target instanceof HTMLElement && event.target.isContentEditable)
  ) {
    event.preventDefault();
    openSearch();
  }
};

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false;
    searchOpen.value = false;
  },
);

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("radio:open-search", openSearch);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("radio:open-search", openSearch);
});
</script>

