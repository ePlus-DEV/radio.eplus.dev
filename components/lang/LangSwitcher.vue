<template>
  <div class="dropdown dropdown-end">
    <label tabindex="0" class="flex flex-row items-center gap-1 normal-case">
      <svg
        class="inline-block h-8 w-8 fill-current text-white cursor-pointer"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 512 512"
      >
        <path
          d="M363,176,246,464h47.24l24.49-58h90.54l24.49,58H480ZM336.31,362,363,279.85,389.69,362Z"
        ></path>
        <path
          d="M272,320c-.25-.19-20.59-15.77-45.42-42.67,39.58-53.64,62-114.61,71.15-143.33H352V90H214V48H170V90H32v44H251.25c-9.52,26.95-27.05,69.5-53.79,108.36-32.68-43.44-47.14-75.88-47.33-76.22L143,152l-38,22,6.87,13.86c.89,1.56,17.19,37.9,54.71,86.57.92,1.21,1.85,2.39,2.78,3.57-49.72,56.86-89.15,79.09-89.66,79.47L64,368l23,36,19.3-11.47c2.2-1.67,41.33-24,92-80.78,24.52,26.28,43.22,40.83,44.3,41.67L255,362Z"
        ></path>
      </svg>
      <svg
        width="12px"
        height="12px"
        class="ml-1 h-3 w-3 fill-current text-white cursor-pointer"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 2048 2048"
      >
        <path
          d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"
        ></path>
      </svg>
    </label>
    <ul
      tabindex="0"
      class="menu dropdown-content p-2 shadow bg-base-100 dark:bg-gray-800 dark:text-white rounded-box w-52 mt-2 gap-1"
    >
      <li
      v-for="localeItem in locales"
      :key="localeItem.code"
      class="flex flex-row items-center dropdown-hover rounded"
      :class="{
        'bg-red-600 opacity-75 text-white p-1 cursor-not-allowed': locale === localeItem.code,
        'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-400': locale !== localeItem.code
      }"
      @click.prevent.stop="setLocale(localeItem.code)"
      >
      <span
        class="cursor-not-allowed w-full rounded"
        :class="{
        'bg-red-600 opacity-75 text-white hover:bg-red-600': locale === localeItem.code,
        'hover:bg-slate-50 dark:hover:bg-slate-400': locale !== localeItem.code
        }"
      >
        <span
        class="badge badge-sm badge-outline !pl-1.5 !pr-1 pt-px font-mono !text-[.6rem] font-bold tracking-widest opacity-50"
        :class="{ 'text-white cursor-not-allowed': locale === localeItem.code }"
        >
        {{ localeItem.code.split('-').pop()?.toUpperCase() }}
        </span>
        <span
        class="ml-1"
        :class="{ 'text-white cursor-not-allowed': locale === localeItem.code }"
        >
        {{ localeItem.name }}
        </span>
      </span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
const config = useRuntimeConfig();
const { locale, locales, setLocale } = useI18n();

const dayjs = useDayjs();
watch(
  locale,
  (newLocale: string) => {
    dayjs.locale(newLocale);
  },
  { immediate: true },
);
</script>