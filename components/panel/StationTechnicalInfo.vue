<template>
  <details class="radio-surface group px-4 py-4 sm:px-6">
    <summary class="radio-interactive flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 [&::-webkit-details-marker]:hidden">
      <span class="flex min-w-0 items-center gap-2.5">
        <UIcon name="i-lucide-info" class="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-300" aria-hidden="true" />
        <span class="text-sm font-semibold">{{ $t('station_technical.title') }}</span>
        <span class="rounded-md bg-[var(--radio-surface-soft)] px-2 py-1 text-[10px] text-[var(--radio-text-muted)]">
          {{ $t('station_technical.catalog_badge') }}
        </span>
      </span>
      <UIcon name="i-lucide-chevron-down" class="h-4 w-4 shrink-0 text-[var(--radio-text-muted)] transition-transform group-open:rotate-180" aria-hidden="true" />
    </summary>

    <div class="mt-3 border-t border-[var(--radio-border)] pt-3">
      <dl v-if="details.hasDetails" class="grid gap-3 sm:grid-cols-3">
        <div class="min-w-0 rounded-xl bg-[var(--radio-surface-soft)] p-3">
          <dt class="text-xs text-[var(--radio-text-muted)]">{{ $t('station_technical.format') }}</dt>
          <dd class="mt-1 text-sm font-semibold">{{ details.format || $t('station_technical.unknown') }}</dd>
          <p v-if="details.format" class="mt-1 text-[11px] leading-5 text-[var(--radio-text-muted)]">
            {{ $t(details.formatEvidence === 'url' ? 'station_technical.inferred_url' : 'station_technical.catalog_reported') }}
          </p>
        </div>
        <div class="min-w-0 rounded-xl bg-[var(--radio-surface-soft)] p-3">
          <dt class="text-xs text-[var(--radio-text-muted)]">{{ $t('station_technical.codec') }}</dt>
          <dd class="mt-1 text-sm font-semibold">{{ details.codec || $t('station_technical.unknown') }}</dd>
          <p v-if="details.codec" class="mt-1 text-[11px] leading-5 text-[var(--radio-text-muted)]">{{ $t('station_technical.catalog_reported') }}</p>
        </div>
        <div class="min-w-0 rounded-xl bg-[var(--radio-surface-soft)] p-3">
          <dt class="text-xs text-[var(--radio-text-muted)]">{{ $t('station_technical.bitrate') }}</dt>
          <dd class="mt-1 text-sm font-semibold tabular-nums">
            {{ details.bitrateKbps !== null ? $t('station_technical.kbps', { count: details.bitrateKbps }) : $t('station_technical.unknown') }}
          </dd>
          <p v-if="details.bitrateKbps !== null" class="mt-1 text-[11px] leading-5 text-[var(--radio-text-muted)]">{{ $t('station_technical.catalog_reported') }}</p>
        </div>
      </dl>
      <dl v-if="facts.hasFacts" class="mt-3 grid gap-3 sm:grid-cols-3">
        <div v-if="facts.category" class="min-w-0 rounded-xl bg-[var(--radio-surface-soft)] p-3">
          <dt class="text-xs text-[var(--radio-text-muted)]">{{ $t('station_technical.category') }}</dt>
          <dd dir="auto" class="mt-1 break-words text-sm font-semibold">{{ facts.category }}</dd>
          <p class="mt-1 text-[11px] leading-5 text-[var(--radio-text-muted)]">{{ $t('station_technical.catalog_reported') }}</p>
        </div>
        <div v-if="facts.language" class="min-w-0 rounded-xl bg-[var(--radio-surface-soft)] p-3">
          <dt class="text-xs text-[var(--radio-text-muted)]">{{ $t('station_technical.language') }}</dt>
          <dd dir="auto" class="mt-1 break-words text-sm font-semibold">{{ facts.language }}</dd>
          <p class="mt-1 text-[11px] leading-5 text-[var(--radio-text-muted)]">{{ $t('station_technical.catalog_reported') }}</p>
        </div>
        <div v-if="facts.homepage" class="min-w-0 rounded-xl bg-[var(--radio-surface-soft)] p-3">
          <dt class="text-xs text-[var(--radio-text-muted)]">{{ $t('station_technical.homepage') }}</dt>
          <dd class="mt-1 min-w-0 text-sm font-semibold">
            <a :href="facts.homepage" target="_blank" rel="noopener noreferrer nofollow"
              class="break-all text-rose-700 underline-offset-4 hover:underline focus-visible:underline dark:text-rose-300">{{ facts.homepageHost }}</a>
          </dd>
          <p class="mt-1 text-[11px] leading-5 text-[var(--radio-text-muted)]">{{ $t('station_technical.homepage_catalog') }}</p>
        </div>
      </dl>
      <p class="mt-3 text-xs leading-5 text-[var(--radio-text-muted)]">{{ $t('station_technical.disclaimer') }}</p>
    </div>
  </details>
</template>

<script setup lang="ts">
defineProps<{
  details: {
    format: string;
    formatEvidence: string;
    codec: string;
    bitrateKbps: number | null;
    hasDetails: boolean;
  };
  facts: {
    category: string;
    language: string;
    homepage: string;
    homepageHost: string;
    hasFacts: boolean;
  };
}>();
</script>
