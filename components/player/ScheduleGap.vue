<template>
  <div
    data-schedule-now
    role="note"
    class="relative my-2 rounded-xl border border-rose-500/25 bg-rose-500/[0.06] px-3 py-3"
  >
    <div class="mb-2 flex items-center gap-2">
      <span class="shrink-0 rounded-md bg-rose-500 px-2 py-1 text-xs font-bold tabular-nums text-white">
        {{ formattedNow }}
      </span>
      <span class="h-px min-w-0 flex-1 bg-rose-500/60" aria-hidden="true"></span>
      <span class="shrink-0 text-[10px] font-semibold text-rose-700 dark:text-rose-300">
        {{ $t('panel.schedule_now_marker') }}
      </span>
    </div>
    <p class="text-xs font-semibold leading-5 text-[var(--radio-text)]">
      {{ $t('panel.schedule_gap_unknown') }}
    </p>
    <p v-if="nextStartTime && nextTitle" class="mt-1 text-xs leading-5 text-[var(--radio-text-muted)]">
      {{ $t('panel.schedule_gap_next', { title: nextTitle, time: formattedNext }) }}
    </p>
    <p v-else class="mt-1 text-xs leading-5 text-[var(--radio-text-muted)]">
      {{ $t('panel.schedule_gap_no_next') }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  timestamp: number;
  nextTitle?: string;
  nextStartTime?: number | null;
}>(), { nextTitle: '', nextStartTime: null });

// Only used for broadcaster reference guides, all in Vietnam's UTC+7 zone.
const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
const formattedNow = computed(() => formatter.format(new Date(props.timestamp * 1000)));
const formattedNext = computed(() => props.nextStartTime
  ? formatter.format(new Date(props.nextStartTime * 1000))
  : '');
</script>
