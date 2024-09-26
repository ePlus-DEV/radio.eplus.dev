<template>
  <div>
    <button
      class="h-10 w-10 flex justify-center items-center focus:outline-none"
      @click="toggleDarkMode"
    >
    <fa
        :icon="['fas', 'desktop']"
        class="w-6 h-6 text-white"
        :class="{
          block: colorMode.value === 'system',
          hidden: colorMode.value !== 'system',
        }"
      />
      <fa
        :icon="['fas', 'sun-bright']"
        class="w-6 h-6 text-yellow-500"
        :class="{
          block: colorMode.value === 'light',
          hidden: colorMode.value !== 'light',
        }"
      />
      <fa
        :icon="['fas', 'moon']"
        class="w-6 h-6 text-yellow-500"
        :class="{
          block: colorMode.value === 'dark',
          hidden: colorMode.value !== 'dark',
        }"
      />
    </button>
  </div>
</template>

<script lang="ts" setup>
const colorMode = useColorMode();
/**
 * Toggles the dark mode theme.
 */
const toggleDarkMode = () => {
  const themes = ["light", "dark", "system"];
  const currentTheme = localStorage.getItem("theme") || "system";
  const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];

  localStorage.setItem("theme", nextTheme);
  document.documentElement.classList.toggle("dark", nextTheme === "dark");
  colorMode.value = nextTheme;
};
</script>
