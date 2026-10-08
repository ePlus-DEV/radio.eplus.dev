<template>
  <div ref="rootRef" class="relative">
    <button
      ref="triggerRef"
      type="button"
      class="btn btn-ghost h-10 min-h-10 gap-2 rounded-xl border-0 px-2.5 text-sm font-medium text-[var(--radio-text-muted)] shadow-none hover:bg-[var(--radio-surface-soft)] hover:text-[var(--radio-text)]"
      :aria-label="$t('navmenu.language')"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="toggleDropdown"
      @keydown.down.prevent="openAndFocusFirst"
      @keydown.escape.prevent="closeDropdown(true)"
    >
      <fa :icon="['fas', 'language']" class="h-4 w-4" />
      <span class="hidden uppercase sm:inline">{{ locale.split("-")[0] }}</span>
      <fa
        :icon="['fas', 'chevron-down']"
        class="h-3 w-3 opacity-60 transition-transform"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <ul
      v-if="open"
      ref="menuRef"
      role="menu"
      :aria-label="$t('navmenu.language')"
      class="radio-scrollbar absolute right-0 top-full z-[80] mt-2 flex max-h-[min(20rem,calc(100vh-6rem))] w-60 max-w-[calc(100vw-1rem)] flex-col gap-1 overflow-x-hidden overflow-y-auto rounded-2xl border border-[var(--radio-border)] bg-[var(--radio-surface)] p-1.5 text-sm text-[var(--radio-text)] shadow-xl shadow-slate-900/10"
      @keydown.escape.prevent.stop="closeDropdown(true)"
      @keydown.tab="closeDropdown()"
    >
      <li
        v-for="localeItem in locales"
        :key="localeItem.code"
        role="none"
        class="w-full min-w-0 list-none"
      >
        <button
          type="button"
          role="menuitemradio"
          :aria-checked="locale === localeItem.code"
          class="flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition"
          :class="
            locale === localeItem.code
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300'
              : 'text-[var(--radio-text-muted)] hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]'
          "
          @click="selectLocale(localeItem.code)"
        >
          <span
            class="flex h-7 min-w-8 items-center justify-center rounded-lg bg-[var(--radio-hover)] px-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--radio-text-muted)]"
          >
            {{ localeItem.code.split("-").pop() }}
          </span>
          <span class="min-w-0 flex-1 truncate">{{ localeItem.name }}</span>
          <fa
            v-if="locale === localeItem.code"
            :icon="['fas', 'check']"
            class="h-3.5 w-3.5"
          />
        </button>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
const { locale, locales, setLocale } = useI18n();
const dayjs = useDayjs();
const route = useRoute();

const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const menuRef = ref<HTMLElement | null>(null);
const open = ref(false);

const closeDropdown = (restoreFocus = false): void => {
  open.value = false;

  if (restoreFocus) {
    nextTick(() => triggerRef.value?.focus());
  }
};

const focusFirstItem = (): void => {
  nextTick(() => {
    menuRef.value
      ?.querySelector<HTMLButtonElement>('[role="menuitemradio"]')
      ?.focus();
  });
};

const toggleDropdown = (): void => {
  open.value = !open.value;
  if (open.value) focusFirstItem();
};

const openAndFocusFirst = (): void => {
  if (!open.value) open.value = true;
  focusFirstItem();
};

const selectLocale = async (code: string): Promise<void> => {
  // Close before locale re-render so focus-within or component updates cannot
  // leave a stale menu visible.
  closeDropdown();
  await setLocale(code);
  triggerRef.value?.focus();
};

const onDocumentPointerDown = (event: PointerEvent): void => {
  if (!open.value) return;

  const target = event.target;
  if (!(target instanceof Node) || rootRef.value?.contains(target)) return;

  closeDropdown();
};

const onDocumentKeydown = (event: KeyboardEvent): void => {
  if (event.key === "Escape" && open.value) {
    event.preventDefault();
    closeDropdown(true);
  }
};

watch(
  locale,
  (newLocale: string) => {
    dayjs.locale(newLocale);
  },
  { immediate: true },
);

watch(
  () => route.fullPath,
  () => closeDropdown(),
);

onMounted(() => {
  document.addEventListener("pointerdown", onDocumentPointerDown);
  document.addEventListener("keydown", onDocumentKeydown);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocumentPointerDown);
  document.removeEventListener("keydown", onDocumentKeydown);
});
</script>
