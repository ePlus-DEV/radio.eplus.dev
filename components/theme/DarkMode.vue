<template>
  <div class="dropdown dropdown-end">
    <button
      tabindex="0"
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
      :aria-label="$t('text.darkmode.' + $colorMode.preference)"
    >
      <fa :icon="['fas', icon]" class="h-4 w-4" />
    </button>

    <div
      tabindex="0"
      class="dropdown-content z-[70] mt-3 w-40 rounded-2xl border border-slate-200 bg-white p-1.5 text-sm shadow-xl shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition"
        :class="
          $colorMode.preference === option.value
            ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
        "
        @click="$colorMode.preference = option.value"
      >
        <fa :icon="['fal', option.icon]" class="h-4 w-4" />
        <span>{{ $t(option.label) }}</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
const colorMode = useColorMode();

const options = [
  { value: "light", icon: "sun-bright", label: "text.darkmode.light" },
  { value: "dark", icon: "moon", label: "text.darkmode.dark" },
  { value: "system", icon: "desktop", label: "text.darkmode.system" },
] as const;

const icons = {
  system: "desktop",
  light: "sun-bright",
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
