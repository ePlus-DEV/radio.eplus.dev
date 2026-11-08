<template>
  <div v-if="showNotice" class="rounded-xl border border-[var(--radio-border)] bg-[var(--radio-surface-elevated)] p-3 text-sm text-[var(--radio-text)]">
    <p role="alert" class="leading-5">{{ $t('recovery.' + health) }}</p>
    <div class="mt-3 flex flex-wrap items-start gap-2">
      <UButton v-if="online && playable" color="primary" variant="soft" class="min-h-11" @click="$emit('retry')">{{ $t('player.retry') }}</UButton>
      <UDropdownMenu v-if="online && sourceItems.length > 1" :items="sourceItems" :content="{ side: 'top', align: 'start' }" :ui="{ content: 'max-w-[calc(100vw-2rem)]' }">
        <UButton color="neutral" variant="outline" class="min-h-11">{{ $t('recovery.change_source') }}</UButton>
      </UDropdownMenu>
      <details v-if="showReport" class="relative min-w-0 open:pb-16">
        <summary class="inline-flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-lg px-2 font-semibold text-rose-700 hover:underline dark:text-rose-300">
          {{ $t('recovery.report') }}
          <UIcon name="i-lucide-chevron-down" class="h-4 w-4" aria-hidden="true" />
        </summary>
        <div class="absolute left-0 top-11 z-20 grid w-[min(18rem,calc(100vw-7rem))] grid-cols-2 gap-1.5 rounded-lg border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] p-1.5 shadow-lg">
          <a v-if="reportEmailUrl" :href="reportEmailUrl" class="inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-md px-1.5 py-2 text-center text-xs font-medium leading-4 hover:bg-[var(--radio-hover)] sm:text-sm">
            <UIcon name="i-lucide-mail" class="h-4 w-4 shrink-0" aria-hidden="true" />{{ $t('recovery.report_email') }}
          </a>
          <a v-if="reportUrl" :href="reportUrl" target="_blank" rel="noopener noreferrer" class="inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-md px-1.5 py-2 text-center text-xs font-medium leading-4 hover:bg-[var(--radio-hover)] sm:text-sm">
            <UIcon name="i-lucide-external-link" class="h-4 w-4 shrink-0" aria-hidden="true" />{{ $t('recovery.report_github') }}
          </a>
        </div>
      </details>
    </div>
    <details v-if="diagnostics?.sourceCount" class="mt-2 text-xs text-[var(--radio-text-muted)]">
      <summary class="cursor-pointer py-1">{{ $t('recovery.details') }}</summary>
      <div class="mt-1 space-y-1 rounded-lg border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] p-2">
        <p class="break-words">{{ $t('recovery.source_position', { index: diagnostics.sourceIndex, total: diagnostics.sourceCount }) }} · {{ diagnostics.sourceLabel }}</p>
        <p v-if="diagnostics.retryAttempt > 0" class="tabular-nums">{{ $t('recovery.attempt', { attempt: diagnostics.retryAttempt, limit: diagnostics.maxAttempts }) }}</p>
        <p v-if="diagnostics.failureReason">{{ $t('recovery.reason_' + diagnostics.failureReason) }}</p>
        <p v-if="diagnostics.lastPlayedAt">{{ $t('recovery.last_played', { time: diagnostics.lastPlayedAt }) }}</p>
        <p>{{ $t('recovery.local_observation') }}</p>
      </div>
    </details>
  </div>
</template>
<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
interface RecoveryDiagnostics {
  sourceIndex: number; sourceCount: number; sourceLabel: string;
  retryAttempt: number; maxAttempts: number;
  failureReason: 'network' | 'decode' | 'timeout' | 'unknown' | '';
  lastPlayedAt: string;
}
const props = defineProps<{
  health: string; online: boolean; playable: boolean;
  sourceItems: DropdownMenuItem[]; reportUrl: string; reportEmailUrl: string;
  diagnostics?: RecoveryDiagnostics;
}>();
defineEmits(['retry']);
const showNotice = computed(() => ['offline', 'exhausted', 'unsupported'].includes(props.health));
const showReport = computed(() => props.online && ['exhausted', 'unsupported'].includes(props.health) && Boolean(props.reportEmailUrl || props.reportUrl));
</script>
