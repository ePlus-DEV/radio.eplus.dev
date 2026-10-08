<template>
  <div ref="rootRef" class="relative">
    <button
      ref="triggerRef"
      type="button"
      class="radio-interactive flex h-10 w-10 items-center justify-center rounded-xl text-[var(--radio-text-muted)] transition hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]"
      :aria-label="$t('text.darkmode.' + $colorMode.preference)"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="open = !open"
      @keydown.escape.prevent="close(true)"
    >
      <fa :icon="['fas', icon]" class="h-4 w-4" />
    </button>
    <div
      v-if="open"
      role="menu"
      class="absolute right-0 top-full z-[80] mt-2 flex w-40 flex-col gap-1 rounded-2xl border border-[var(--radio-border)] bg-[var(--radio-surface)] p-1.5 text-sm text-[var(--radio-text)] shadow-xl"
      @keydown.escape.prevent="close(true)"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        role="menuitemradio"
        :aria-checked="$colorMode.preference === option.value"
        class="radio-interactive flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition"
        :class="$colorMode.preference === option.value
          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300'
          : 'text-[var(--radio-text-muted)] hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]'"
        @click="selectTheme(option.value)"
      >
        <fa :icon="['fas', option.icon]" class="h-4 w-4" />
        <span>{{ $t(option.label) }}</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
const colorMode = useColorMode();
const route = useRoute();
const rootRef = ref<HTMLElement | null>(null);
const triggerRef = ref<HTMLButtonElement | null>(null);
const open = ref(false);

const options = [
  { value: "light", icon: "sun", label: "text.darkmode.light" },
  { value: "dark", icon: "moon", label: "text.darkmode.dark" },
  { value: "system", icon: "desktop", label: "text.darkmode.system" },
] as const;

const icons = { system: "desktop", light: "sun", dark: "moon" } as const;
const icon = computed(() =>
  icons[colorMode.preference as keyof typeof icons] || icons.system
);
const close = (restoreFocus = false) => {
  open.value = false;
  if (restoreFocus) nextTick(() => triggerRef.value?.focus());
};
const selectTheme = (value: "light" | "dark" | "system") => {
  close();
  colorMode.preference = value;
};

const outsideClick = (event: PointerEvent) => {
  if (event.target instanceof Node && !rootRef.value?.contains(event.target)) {
    close();
  }
};
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape" && open.value) close(true);
};
watch(() => route.fullPath, () => close());
watch(() => colorMode.preference, (theme) => {
  if (import.meta.client) localStorage.setItem("theme", theme);
});
onMounted(() => {
  document.addEventListener("pointerdown", outsideClick);
  document.addEventListener("keydown", onKeydown);
});
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", outsideClick);
  document.removeEventListener("keydown", onKeydown);
});
</script>
