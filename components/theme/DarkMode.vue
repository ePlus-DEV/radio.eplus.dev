<template>
  <div>
    <button
    class="h-10 w-10 flex justify-center items-center focus:outline-none text-yellow-500"
    @click="toggleDarkMode"
  >
    <fa
      :icon="['fas', 'sun-bright']"
      class="w-6 h-6"
      :class="{
        block: colorMode.value === 'light',
        hidden: colorMode.value !== 'light',
      }"
    />
    <fa
      :icon="['fas', 'moon']"
      class="w-6 h-6"
      :class="{ block: colorMode.value === 'dark', hidden: colorMode.value !== 'dark' }"
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
  const isLightTheme = localStorage.getItem("theme") === "light";
  const newTheme = isLightTheme ? "dark" : "light";
  localStorage.setItem("theme", newTheme);
  document.documentElement.classList.toggle("dark", newTheme === "dark");
  colorMode.value = newTheme;
};
</script>
