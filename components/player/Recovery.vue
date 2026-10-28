<template>
  <div v-if="health" class="rounded-xl border border-[var(--radio-border)] bg-[var(--radio-surface-elevated)] p-3 text-sm text-[var(--radio-text)]">
    <p role="status" class="leading-5">{{ $t(`recovery.${health}`) }}</p>
    <div v-if="health !== 'connecting'" class="mt-2 flex flex-wrap items-center gap-2">
      <UButton v-if="online && playable" color="neutral" variant="soft" class="min-h-11" @click="$emit('retry')">{{ $t('player.retry') }}</UButton>
      <UDropdownMenu v-if="online && sourceItems.length > 1" :items="sourceItems" :content="{ side: 'top', align: 'start' }" :ui="{ content: 'max-w-[calc(100vw-2rem)]' }">
        <UButton color="neutral" variant="outline" class="min-h-11">{{ $t('player.source') }}</UButton>
      </UDropdownMenu>
      <a v-if="reportUrl && online" :href="reportUrl" target="_blank" rel="noopener noreferrer" class="inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-rose-700 underline-offset-4 hover:underline dark:text-rose-300">{{ $t('recovery.report') }}</a>
    </div>
    <p v-if="health === 'exhausted' || health === 'unsupported'" class="mt-2 text-xs text-[var(--radio-text-muted)]">{{ $t('recovery.report_hint') }}</p>
  </div>
</template>
<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
defineProps<{ health: string; online: boolean; playable: boolean; sourceItems: DropdownMenuItem[]; reportUrl: string }>();
defineEmits(['retry']);
</script>
