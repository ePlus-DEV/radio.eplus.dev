<template>
  <div class="dropdown dropdown-end">
    <button
      tabindex="0"
      type="button"
      class="btn btn-ghost btn-square h-10 min-h-10 w-10 rounded-xl border-0 text-[var(--radio-text-muted)] shadow-none hover:bg-[var(--radio-surface-soft)] hover:text-[var(--radio-text)]"
      :aria-label="$t('text.darkmode.' + $colorMode.preference)"
    >
      <fa :icon="['fas', icon]" class="h-4 w-4" />
    </button>

    <div
      tabindex="0"
      class="menu dropdown-content z-[70] mt-3 w-40 rounded-2xl border border-[var(--radio-border)] bg-[var(--radio-surface)] p-1.5 text-sm text-[var(--radio-text)] shadow-xl shadow-slate-900/10"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition"
        :class="
          $colorMode.preference === option.value
            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300'
            : 'text-[var(--radio-text-muted)] hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]'
        "
        @click="$colorMode.preference = option.value"
      >
        <fa :icon="['fas', option.icon]" class="h-4 w-4" />
        <span>{{ $t(option.label) }}</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
const colorMode = useColorMode();

const options = [
  { value: "light", icon: "sun", label: "text.darkmode.light" },
  { value: "dark", icon: "moon", label: "text.darkmode.dark" },
  { value: "system", icon: "desktop", label: "text.darkmode.system" },
] as const;

const icons = {
  system: "desktop",
  light: "sun",
  dark: "moon",
};

const icon = computed(
  () => icons[colorMode.preference as keyof typeof icons] || icons.system,
);

watch(
  () => colorMode.preference,
  (theme) => {
    if (!import.meta.client) return;
    localStorage.setItem("theme", theme);
  },
);
</script>
