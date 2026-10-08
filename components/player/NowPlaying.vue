<template>
  <div class="radio-now-playing radio-scrollbar h-full min-h-0 overflow-y-auto bg-[var(--radio-page-bg)] text-[var(--radio-text)]">
    <div class="mx-auto flex w-full max-w-md flex-col px-6 pb-6">
      <header class="flex min-h-16 items-center justify-between gap-3">
        <UButton color="neutral" variant="ghost" icon="i-lucide-chevron-down" class="h-11 w-11 justify-center" :aria-label="$t('button.close')" @click="$emit('close')" />
        <h2 class="text-sm font-semibold">{{ $t('redesign.now_playing') }}</h2>
        <UButton color="neutral" variant="ghost" icon="i-lucide-list-music" class="h-11 w-11 justify-center" :aria-label="$t('player.queue')" @click="$emit('queue')" />
      </header>
      <StationArtwork :src="artwork" :alt="title" eager class="radio-now-playing-artwork radio-themed-artwork mx-auto mt-4 aspect-square w-full rounded-2xl object-contain shadow-xl sm:mt-6" />
      <div class="mt-6 flex min-w-0 items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 dir="auto" class="break-words text-2xl font-bold leading-tight">{{ title }}</h3>
          <p v-if="artist" dir="auto" class="mt-2 break-words text-sm text-[var(--radio-text-muted)]">{{ artist }}</p>
          <p dir="auto" class="mt-1 break-words text-xs text-[var(--radio-text-muted)]">{{ stationName }}</p>
        </div>
        <UButton color="neutral" :variant="favorite ? 'soft' : 'ghost'" icon="i-lucide-heart" class="h-11 w-11 shrink-0 justify-center" :class="favorite ? 'text-rose-500' : ''" :aria-pressed="favorite" :aria-label="$t(favorite ? 'library.remove_favorite' : 'library.add_favorite')" @click="$emit('favorite')" />
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-2 text-xs" role="status">
        <span class="rounded-full bg-[var(--radio-surface-soft)] px-3 py-1.5" :class="playing ? 'text-emerald-500' : 'text-[var(--radio-text-muted)]'">{{ status }}</span>
        <span v-if="sleepRemaining" class="text-[var(--radio-text-muted)]">{{ $t('player.sleep_remaining', { minutes: sleepRemaining }) }}</span>
        <UButton v-if="error" variant="link" @click="$emit('retry')">{{ $t('player.retry') }}</UButton>
      </div>
      <div class="my-7 flex items-center justify-center gap-7">
        <UButton color="neutral" variant="ghost" icon="i-lucide-skip-back" class="h-14 w-14 justify-center rounded-full" :disabled="!canNavigate" :aria-label="previousLabel" @click="$emit('previous')" />
        <UButton :icon="waiting ? 'i-lucide-loader-circle' : playing ? 'i-lucide-pause' : 'i-lucide-play'" class="h-20 w-20 justify-center rounded-full bg-violet-600 text-white hover:bg-violet-500 [&_.iconify]:h-8 [&_.iconify]:w-8" :disabled="!playable" :aria-label="$t(playing || waiting ? 'player.pause' : 'player.play')" @click="$emit('toggle')" />
        <UButton color="neutral" variant="ghost" icon="i-lucide-skip-forward" class="h-14 w-14 justify-center rounded-full" :disabled="!canNavigate" :aria-label="nextLabel" @click="$emit('next')" />
      </div>
      <div class="grid grid-cols-3 gap-2">
        <UDropdownMenu :items="sleepItems" :content="{ align: 'start', side: 'top' }">
          <UButton color="neutral" variant="ghost" class="radio-player-tool" :disabled="!playable"><UIcon name="i-lucide-timer" class="h-5 w-5" />{{ $t('redesign.timer') }}</UButton>
        </UDropdownMenu>
        <UDropdownMenu :items="sourceItems" :content="{ align: 'center', side: 'top' }" :ui="{ content: 'max-w-[calc(100vw-2rem)]' }">
          <UButton color="neutral" variant="ghost" class="radio-player-tool" :disabled="!sourceItems.length"><UIcon name="i-lucide-radio-tower" class="h-5 w-5" />{{ $t('player.source') }}</UButton>
        </UDropdownMenu>
        <UButton color="neutral" variant="ghost" class="radio-player-tool" @click="$emit('queue')"><UIcon name="i-lucide-list-music" class="h-5 w-5" />{{ $t('redesign.channel_list') }}</UButton>
      </div>
      <UButton v-if="lyricsAvailable" color="neutral" variant="soft" icon="i-lucide-mic-vocal" class="mt-3 min-h-11 justify-center" @click="$emit('lyrics')">{{ $t('panel.lyric') }}</UButton>
      <div v-if="nextTitle" class="mt-5 rounded-2xl border border-[var(--radio-border)] bg-[var(--radio-surface)] p-4">
        <p class="mb-2 text-[11px] text-[var(--radio-text-muted)]">{{ $t('panel.next') }}</p>
        <p dir="auto" class="break-words text-sm font-semibold">{{ nextTitle }}</p>
        <p v-if="nextArtist" dir="auto" class="mt-1 text-xs text-[var(--radio-text-muted)]">{{ nextArtist }}</p>
      </div>
      <UButton v-else-if="nextStationTitle" color="neutral" variant="soft" trailing-icon="i-lucide-chevron-right" class="mt-5 min-h-16 w-full justify-between rounded-2xl p-4" @click="$emit('next')">
        <span class="min-w-0 text-left"><span class="mb-1 block text-[11px] text-[var(--radio-text-muted)]">{{ $t('redesign.next_station') }}</span><span dir="auto" class="block truncate text-sm font-semibold">{{ nextStationTitle }}</span></span>
      </UButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui';
defineProps<{
  title: string; artist?: string; artwork?: string; stationName: string; status: string;
  playing: boolean; waiting: boolean; playable: boolean; favorite: boolean; error: boolean;
  canNavigate: boolean; previousLabel: string; nextLabel: string; sleepRemaining: number;
  sleepItems: DropdownMenuItem[]; sourceItems: DropdownMenuItem[]; lyricsAvailable?: boolean;
  nextTitle?: string; nextArtist?: string; nextStationTitle?: string;
}>();
defineEmits(['close', 'favorite', 'previous', 'next', 'toggle', 'queue', 'lyrics', 'retry']);
</script>
