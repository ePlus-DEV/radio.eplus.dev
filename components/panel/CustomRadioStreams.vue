<template>
  <section class="radio-surface p-4 sm:p-5" :aria-label="$t('custom_streams.title')">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h2 class="flex items-center gap-2 text-lg font-bold">
          <UIcon name="i-lucide-radio-tower" class="h-5 w-5 text-rose-600 dark:text-rose-400" aria-hidden="true" />
          {{ $t('custom_streams.title') }}
          <span class="text-xs font-normal text-[var(--radio-text-muted)]">{{ records.length }}/{{ MAX_CUSTOM_STREAMS }}</span>
        </h2>
        <p class="mt-1 text-xs leading-5 text-[var(--radio-text-muted)]">{{ $t('custom_streams.description') }}</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton color="neutral" variant="outline" size="sm" :disabled="broken || busy || !records.length" @click="exportFile">
          {{ $t('custom_streams.export') }}
        </UButton>
        <UButton color="neutral" variant="outline" size="sm" :disabled="broken || busy" @click="fileInput?.click()">
          {{ $t('custom_streams.import') }}
        </UButton>
        <input ref="fileInput" class="sr-only" type="file" accept="application/json,.json" :aria-label="$t('custom_streams.import')" @change="importFile" />
      </div>
    </div>

    <p v-if="notice" role="status" class="mt-3 text-sm text-[var(--radio-text-muted)]">{{ notice }}</p>
    <p v-if="error" role="alert" class="mt-3 text-sm text-rose-700 dark:text-rose-300">{{ error }}</p>
    <div v-if="broken" class="mt-3 flex flex-wrap gap-2">
      <UButton color="neutral" variant="outline" @click="download(rawBackup, 'onair-custom-streams-damaged.json')">{{ $t('custom_streams.backup') }}</UButton>
      <UButton color="error" variant="outline" @click="resetOpen = true">{{ $t('custom_streams.reset') }}</UButton>
    </div>

    <form class="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_auto] sm:items-end" @submit.prevent="submit">
      <div class="min-w-0">
        <label for="custom-radio-title" class="mb-1 block text-xs font-medium text-[var(--radio-text-muted)]">{{ $t('custom_streams.name') }}</label>
        <input id="custom-radio-title" v-model="title" type="text" autocomplete="off" maxlength="96" :disabled="broken || busy" :placeholder="$t('custom_streams.name')" class="min-h-11 w-full min-w-0 rounded-xl border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] px-3 text-sm text-[var(--radio-text)]" />
      </div>
      <div class="min-w-0">
        <label for="custom-radio-url" class="mb-1 block text-xs font-medium text-[var(--radio-text-muted)]">{{ $t('custom_streams.url') }}</label>
        <input id="custom-radio-url" v-model="streamUrl" type="url" inputmode="url" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="2048" :disabled="broken || busy" placeholder="https://radio.example.org/live.mp3" class="min-h-11 w-full min-w-0 rounded-xl border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] px-3 text-sm text-[var(--radio-text)]" />
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton type="submit" :disabled="broken || busy || !title.trim() || !streamUrl.trim() || (!editingUrl && records.length >= MAX_CUSTOM_STREAMS)">
          {{ $t(editingUrl ? 'custom_streams.save' : 'custom_streams.add') }}
        </UButton>
        <UButton v-if="editingUrl" color="neutral" variant="outline" type="button" @click="cancelEdit">{{ $t('custom_streams.cancel') }}</UButton>
      </div>
    </form>
    <p class="mt-3 text-xs leading-5 text-[var(--radio-text-muted)]">{{ $t('custom_streams.disclaimer') }}</p>

    <p v-if="!records.length && !broken" class="mt-4 text-sm text-[var(--radio-text-muted)]">{{ $t('custom_streams.empty') }}</p>
    <ul v-if="records.length" class="mt-4 grid gap-2 sm:grid-cols-2">
      <li v-for="stream in records" :key="stream.url" class="min-w-0 rounded-xl border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] p-3">
        <div class="flex min-w-0 items-start justify-between gap-2">
          <div class="min-w-0">
            <p dir="auto" class="break-words text-sm font-semibold">{{ stream.title }}</p>
            <p class="mt-1 text-xs text-[var(--radio-text-muted)]">
              {{ $t('custom_streams.format_hint') }}: {{ stream.format.toUpperCase() }}
            </p>
          </div>
          <div class="flex shrink-0 gap-1">
            <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-pencil" :aria-label="$t('custom_streams.edit') + ': ' + stream.title" @click="startEdit(stream)" />
            <UButton color="error" variant="ghost" size="sm" icon="i-lucide-trash-2" :aria-label="$t('custom_streams.delete') + ': ' + stream.title" @click="deleteUrl = stream.url" />
          </div>
        </div>
        <p class="mt-2 break-all text-[11px] leading-5 text-[var(--radio-text-muted)]">{{ stream.url }}</p>
        <p class="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
          {{ $t(stream.url.startsWith('http:') ? 'custom_streams.http_warning' : 'custom_streams.unverified') }}
        </p>
      </li>
    </ul>

    <UModal :open="Boolean(deleteUrl)" :title="$t('custom_streams.confirm_delete')" :description="$t('custom_streams.confirm_delete_description')" @update:open="open => { if (!open) deleteUrl = ''; }">
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="outline" @click="deleteUrl = ''">{{ $t('custom_streams.cancel') }}</UButton>
          <UButton color="error" @click="confirmDelete">{{ $t('custom_streams.delete') }}</UButton>
        </div>
      </template>
    </UModal>
    <UModal v-model:open="resetOpen" :title="$t('custom_streams.reset')" :description="$t('custom_streams.reset_description')">
      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="outline" @click="resetOpen = false">{{ $t('custom_streams.cancel') }}</UButton>
          <UButton color="error" @click="resetDamaged">{{ $t('custom_streams.reset') }}</UButton>
        </div>
      </template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import {
  CUSTOM_STREAMS_STORAGE_KEY, MAX_CUSTOM_STREAMS, validateCustomStream,
  addCustomStream, editCustomStream, removeCustomStream,
  normalizeCustomStreams, parseCustomStreams, serializeCustomStreams,
} from '~/utils/custom-radio-streams.mjs';

type CustomStream = { title: string; url: string; format: string };
type EditResult = { ok: boolean; streams?: CustomStream[]; reason?: string };
const { t } = useI18n();
const records = ref<CustomStream[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const title = ref('');
const streamUrl = ref('');
const editingUrl = ref('');
const deleteUrl = ref('');
const notice = ref('');
const error = ref('');
const busy = ref(false);
const broken = ref(false);
const rawBackup = ref('');
const resetOpen = ref(false);
let generation = 0;

const loadLocal = (raw: string | null) => {
  if (raw === null) {
    records.value = [];
    broken.value = false;
    rawBackup.value = '';
    return;
  }
  // Do not silently overwrite damaged data with an empty collection.
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== 1 || !Array.isArray(data.streams) || raw.length > 100_000) throw new Error('invalid');
    records.value = parseCustomStreams(raw);
    broken.value = false;
    rawBackup.value = '';
  } catch {
    broken.value = true;
    rawBackup.value = raw;
    records.value = [];
    error.value = t('custom_streams.damaged');
  }
};
const onStorage = (event: StorageEvent) => {
  if (event.key !== CUSTOM_STREAMS_STORAGE_KEY && event.key !== null) return;
  editingUrl.value = '';
  title.value = '';
  streamUrl.value = '';
  loadLocal(event.key === null ? null : event.newValue);
};
onMounted(() => {
  try { loadLocal(localStorage.getItem(CUSTOM_STREAMS_STORAGE_KEY)); }
  catch { error.value = t('custom_streams.storage_error'); broken.value = true; }
  window.addEventListener('storage', onStorage);
});
onBeforeUnmount(() => {
  generation += 1;
  window.removeEventListener('storage', onStorage);
});

const save = (next: CustomStream[]) => {
  if (broken.value) return false;
  try {
    localStorage.setItem(CUSTOM_STREAMS_STORAGE_KEY, serializeCustomStreams(next));
    records.value = normalizeCustomStreams(next);
    error.value = '';
    return true;
  } catch {
    error.value = t('custom_streams.storage_error');
    return false;
  }
};
const cancelEdit = () => { editingUrl.value = ''; title.value = ''; streamUrl.value = ''; };
const startEdit = (stream: CustomStream) => {
  if (broken.value) return;
  editingUrl.value = stream.url;
  title.value = stream.title;
  streamUrl.value = stream.url;
  error.value = '';
};
const submit = () => {
  if (broken.value || busy.value) return;
  const input = { title: title.value, url: streamUrl.value };
  const result = (editingUrl.value
    ? editCustomStream(records.value, editingUrl.value, input)
    : addCustomStream(records.value, input)) as EditResult;
  if (!result.ok || !result.streams) {
    error.value = t('custom_streams.errors.' + (result.reason || 'invalid_url'));
    return;
  }
  if (save(result.streams)) {
    cancelEdit();
    notice.value = t('custom_streams.saved');
  }
};
const confirmDelete = () => {
  if (broken.value || !deleteUrl.value) return;
  if (save(removeCustomStream(records.value, deleteUrl.value))) {
    if (editingUrl.value === deleteUrl.value) cancelEdit();
    deleteUrl.value = '';
    notice.value = t('custom_streams.deleted');
  }
};
const download = (text: string, filename: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const exportFile = () => {
  if (!broken.value && records.value.length) download(serializeCustomStreams(records.value), 'onair-custom-streams.json');
};
const importFile = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file || broken.value || busy.value) return;
  if (file.size > 100_000) { error.value = t('custom_streams.import_error'); return; }
  busy.value = true;
  error.value = '';
  const currentGeneration = ++generation;
  try {
    const raw = await file.text();
    const data = JSON.parse(raw);
    if (!data || data.version !== 1 || !Array.isArray(data.streams)) throw new Error('version');
    const valid = normalizeCustomStreams(data.streams);
    if (data.streams.length && !valid.length) throw new Error('invalid');
    if (currentGeneration !== generation || broken.value) return;
    let next = records.value;
    let added = 0;
    for (const candidate of valid) {
      const outcome = addCustomStream(next, candidate) as EditResult;
      if (!outcome.ok || !outcome.streams) continue;
      next = outcome.streams;
      added += 1;
    }
    if (save(next)) notice.value = t('custom_streams.import_done', { count: added, skipped: data.streams.length - added });
  } catch {
    if (currentGeneration === generation) error.value = t('custom_streams.import_error');
  } finally {
    if (currentGeneration === generation) busy.value = false;
  }
};
const resetDamaged = () => {
  try {
    const current = localStorage.getItem(CUSTOM_STREAMS_STORAGE_KEY);
    if (!broken.value || current !== rawBackup.value) {
      loadLocal(current);
      resetOpen.value = false;
      return;
    }
    localStorage.removeItem(CUSTOM_STREAMS_STORAGE_KEY);
    broken.value = false;
    rawBackup.value = '';
    records.value = [];
    error.value = '';
    resetOpen.value = false;
  } catch { error.value = t('custom_streams.storage_error'); }
};
</script>
