<template>
  <div class="dropdown dropdown-end">
    <button
      tabindex="0"
      type="button"
      class="flex h-10 items-center gap-2 rounded-xl px-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
      :aria-label="$t('navmenu.language')"
    >
      <fa :icon="['fas', 'language']" class="h-4 w-4" />
      <span class="hidden uppercase sm:inline">{{ locale.split("-")[0] }}</span>
      <fa :icon="['fas', 'chevron-down']" class="h-3 w-3 opacity-60" />
    </button>

    <ul
      tabindex="0"
      class="dropdown-content z-[70] mt-3 max-h-80 w-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 text-sm shadow-xl shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900"
    >
      <li v-for="localeItem in locales" :key="localeItem.code">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition"
          :class="
            locale === localeItem.code
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
          "
          @click="setLocale(localeItem.code)"
        >
          <span
            class="flex h-7 min-w-8 items-center justify-center rounded-lg bg-slate-100 px-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-white/5 dark:text-slate-400"
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

watch(
  locale,
  (newLocale: string) => {
    dayjs.locale(newLocale);
  },
  { immediate: true },
);
</script>
