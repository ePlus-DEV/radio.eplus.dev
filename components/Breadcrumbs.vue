<template>
  <nav
    aria-label="Breadcrumb"
    class="mb-4 flex min-w-0 items-center gap-1.5 overflow-x-auto py-1 text-xs font-medium text-slate-400 sm:mb-5"
  >
    <NuxtLink
      to="/"
      class="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]"
    >
      <fa :icon="['fas', 'house']" class="h-3 w-3" />
      <span class="hidden sm:inline">{{ $t("navmenu.homepage") }}</span>
    </NuxtLink>

    <template v-if="level_1 !== undefined && level_1_slug !== undefined">
      <fa :icon="['fas', 'chevron-right']" class="h-2.5 w-2.5 shrink-0 opacity-40" />
      <NuxtLink
        :to="`/${area}`"
        class="shrink-0 rounded-lg px-2 py-1.5 transition hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]"
      >
        {{ $t(`world.${area.replace(/-/g, "_")}.name`) }}
      </NuxtLink>

      <template v-if="level_2 !== undefined">
        <fa :icon="['fas', 'chevron-right']" class="h-2.5 w-2.5 shrink-0 opacity-40" />
        <NuxtLink
          :to="`/${area}/${level_1_slug}`"
          class="shrink-0 rounded-lg px-2 py-1.5 transition hover:bg-[var(--radio-hover)] hover:text-[var(--radio-text)]"
        >
          {{ $t(level_1) }}
        </NuxtLink>
      </template>

      <template v-else>
        <fa :icon="['fas', 'chevron-right']" class="h-2.5 w-2.5 shrink-0 opacity-40" />
        <span class="shrink-0 px-2 py-1.5 text-[var(--radio-text-muted)]">
          {{ $t(level_1) }}
        </span>
      </template>
    </template>

    <template v-if="level_2 !== undefined">
      <fa :icon="['fas', 'chevron-right']" class="h-2.5 w-2.5 shrink-0 opacity-40" />
      <span class="max-w-[220px] truncate px-2 py-1.5 text-[var(--radio-text-muted)] sm:max-w-md">
        {{ level_2 }}
      </span>
    </template>
  </nav>
</template>

<script lang="ts">
export default defineComponent({
  name: "Breadcrumbs",
  props: {
    area: {
      type: String,
      default: undefined,
    },
    level_1: {
      type: String,
      default: undefined,
    },
    level_1_slug: {
      type: String,
      default: undefined,
    },
    level_2: {
      type: String,
      default: undefined,
    },
  },
});
</script>
