<template>
  <div>
    <div class="dropdown dropdown-end">
      <label
        tabindex="0"
        class="h-10 w-10 flex justify-center items-center focus:outline-none"
      >
        <fa
          :icon="['fas', icon]"
          class="w-6 h-6"
          :class="
            $colorMode.preference !== 'system'
              ? 'text-yellow-500'
              : 'text-white'
          "
        />
      </label>

      <div
        class="menu dropdown-content p-2 gap-1 absolute z-50 top-full right-0 bg-white rounded-lg ring-1 ring-slate-900/10 shadow-lg overflow-hidden w-36 py-1 text-sm text-slate-700 font-semibold dark:bg-slate-800 dark:ring-0 dark:highlight-white/5 dark:text-slate-300 mt-4"
        id="headlessui-listbox-options-:R7beilb6:"
        aria-labelledby="headlessui-listbox-button-:R5beilb6:"
        aria-orientation="vertical"
        role="listbox"
        tabindex="0"
        data-headlessui-state="open"
        data-open=""
        style="--button-width: 24px"
      >
        <div
          class="py-1 px-2 flex items-center cursor-pointer"
          :class="
            $colorMode.preference === 'light'
              ? 'text-sky-500 cursor-not-allowed'
              : 'cursor-pointer'
          "
          role="option"
          @click.prevent.stop="$colorMode.preference = 'light'"
        >
          <fa
            :icon="['fal', 'sun-bright']"
            class="w-6 h-6 mr-2"
            :class="
              $colorMode.preference !== 'light'
                ? 'text-slate-400 dark:text-slate-500'
                : ''
            "
          />
          {{ $t('text.darkmode.light') }}
        </div>
        <div
          class="py-1 px-2 flex items-center"
          :class="
            $colorMode.preference === 'dark'
              ? 'text-sky-500 cursor-not-allowed'
              : 'cursor-pointer'
          "
          role="option"
          @click.prevent.stop="$colorMode.preference = 'dark'"
        >
          <fa
            :icon="['fal', 'moon']"
            class="w-6 h-6 mr-2"
            :class="
              $colorMode.preference !== 'dark'
                ? 'text-slate-400 dark:text-slate-500'
                : ''
            "
          />
          {{ $t('text.darkmode.dark') }}
        </div>
        <div
          class="py-1 px-2 flex items-center"
          :class="
            $colorMode.preference === 'system'
              ? 'text-sky-500 cursor-not-allowed'
              : 'cursor-pointer'
          "
          role="option"
          @click.prevent.stop="$colorMode.preference = 'system'"
        >
          <fa
            :icon="['fal', 'desktop']"
            class="w-6 h-6 mr-2"
            :class="
              $colorMode.preference !== 'system'
                ? 'text-slate-400 dark:text-slate-500'
                : ''
            "
          />
          {{ $t('text.darkmode.system') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const colorMode = useColorMode();

/**
 * Icon mapping for each color mode.
 */
const icons = {
  system: "desktop",
  light: "sun-bright",
  dark: "moon",
};

const icon = ref(icons[colorMode.preference as keyof typeof icons]);

if (typeof window !== "undefined") {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme) {
    icon.value = icons[storedTheme as keyof typeof icons];
  }
}

watch(
  () => colorMode.preference,
  (newVal: string) => {
    icon.value = icons[newVal as keyof typeof icons];
  },
  { immediate: true },
);
</script>
