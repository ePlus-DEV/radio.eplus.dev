<template>
  <div>
    <button
      class="h-10 w-10 flex justify-center items-center focus:outline-none"
      @click="toggleDarkMode"
    >
      <fa
        v-for="(icon, mode) in icons"
        :key="mode"
        :icon="['fas', icon]"
        class="w-6 h-6"
        :class="[
          { block: colorMode.value === mode, hidden: colorMode.value !== mode },
          mode !== 'system' ? 'text-yellow-500' : 'text-white',
        ]"
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

/**
 * Icon mapping for each color mode.
 */
const icons = {
  system: "desktop",
  light: "sun-bright",
  dark: "moon",
};
</script>
