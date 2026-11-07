<template>
  <section class="radio-surface p-4 sm:p-5" :aria-label="$t('collections.title')">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div><h2 class="text-lg font-bold">{{ $t('collections.title') }}</h2><p class="mt-1 text-xs text-[var(--radio-text-muted)]">{{ $t('collections.description') }}</p></div>
      <div class="flex flex-wrap gap-2">
        <UButton color="neutral" variant="outline" :disabled="broken || !collections.length" @click="exportFile">{{ $t('collections.export') }}</UButton>
        <UButton color="neutral" variant="outline" :disabled="broken || busy" @click="fileInput?.click()">{{ $t('collections.import') }}</UButton>
        <input ref="fileInput" type="file" accept="application/json,.json" class="sr-only" @change="importFile" />
      </div>
    </div>
    <p v-if="notice" role="status" class="mt-3 text-sm text-[var(--radio-text-muted)]">{{ notice }}</p>
    <div v-if="broken" class="mt-3 flex flex-wrap gap-2">
      <UButton color="neutral" variant="outline" @click="downloadBackup">{{ $t('collections.backup_damaged') }}</UButton>
      <UButton color="error" variant="outline" @click="resetOpen = true">{{ $t('collections.reset_damaged') }}</UButton>
    </div>
    <form class="mt-4 flex flex-wrap gap-2" @submit.prevent="createCollection">
      <label for="collection-name" class="sr-only">{{ $t('collections.name') }}</label>
      <input id="collection-name" v-model="newName" maxlength="80" :placeholder="$t('collections.name')" class="min-h-11 min-w-0 flex-1 rounded-lg border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] px-3 text-sm text-[var(--radio-text)]" />
      <UButton type="submit" :disabled="broken || !newName.trim() || collections.length >= COLLECTIONS_LIMIT">{{ $t('collections.create') }}</UButton>
    </form>
    <p v-if="!collections.length" class="mt-4 text-sm text-[var(--radio-text-muted)]">{{ $t('collections.empty') }}</p>
    <div v-else class="mt-4 space-y-3">
      <details v-for="collection in collections" :key="collection.id" class="rounded-xl border border-[var(--radio-border)] bg-[var(--radio-surface-soft)] p-3">
        <summary class="cursor-pointer text-sm font-semibold" dir="auto">{{ collection.name }} <span class="font-normal text-[var(--radio-text-muted)]">({{ collection.stations.length }})</span></summary>
        <div class="mt-3 space-y-3">
          <div class="flex flex-wrap gap-2">
            <UButton size="sm" icon="i-lucide-play" :disabled="!collection.stations.length" @click="playAll(collection)">{{ $t('collections.play_all') }}</UButton>
            <UButton color="neutral" variant="outline" size="sm" :aria-pressed="editingId === collection.id" @click="editingId = editingId === collection.id ? '' : collection.id">{{ $t(editingId === collection.id ? 'collections.done_editing' : 'collections.edit_stations') }}</UButton>
            <UButton color="neutral" variant="outline" size="sm" :disabled="broken" @click="startRename(collection)">{{ $t('collections.rename') }}</UButton>
            <UButton color="error" variant="outline" size="sm" :disabled="broken" @click="deleteId = collection.id">{{ $t('collections.delete') }}</UButton>
          </div>
          <form v-if="renameId === collection.id" class="flex gap-2" @submit.prevent="renameCollection(collection.id)">
            <label :for="`rename-${collection.id}`" class="sr-only">{{ $t('collections.name') }}</label>
            <input :id="`rename-${collection.id}`" v-model="renameName" maxlength="80" class="min-h-11 min-w-0 flex-1 rounded-lg border border-[var(--radio-border)] bg-[var(--radio-surface)] px-3 text-sm" />
            <UButton type="submit" :disabled="!renameName.trim()">{{ $t('collections.save') }}</UButton>
            <UButton color="neutral" variant="ghost" @click="renameId = ''">{{ $t('collections.cancel') }}</UButton>
          </form>
          <div class="flex flex-wrap gap-2">
            <label :for="`add-${collection.id}`" class="sr-only">{{ $t('collections.choose_station') }}</label>
            <select :id="`add-${collection.id}`" v-model="chosen[collection.id]" class="min-h-11 min-w-0 flex-1 rounded-lg border border-[var(--radio-border)] bg-[var(--radio-surface)] px-3 text-sm">
              <option value="">{{ $t('collections.choose_station') }}</option>
              <option v-for="station in available(collection)" :key="station.url" :value="station.url">{{ station.title }}</option>
            </select>
            <UButton color="neutral" variant="outline" :disabled="broken || !chosen[collection.id] || collection.stations.length >= COLLECTION_STATIONS_LIMIT" @click="addStation(collection)">{{ $t('collections.add') }}</UButton>
          </div>
          <p class="text-xs text-[var(--radio-text-muted)]">{{ $t('collections.add_hint') }}</p>
          <ol v-if="editingId === collection.id && collection.stations.length" class="space-y-1">
            <li v-for="(station, index) in collection.stations" :key="station.url" class="flex min-w-0 items-center gap-1 rounded-lg bg-[var(--radio-surface)] p-2">
              <span class="min-w-0 flex-1 truncate text-sm" dir="auto">{{ station.title }}</span>
              <UButton color="neutral" variant="ghost" icon="i-lucide-chevron-up" :disabled="broken || index === 0" :aria-label="$t('collections.move_up') + ': ' + station.title" @click="moveStation(collection, index, -1)" />
              <UButton color="neutral" variant="ghost" icon="i-lucide-chevron-down" :disabled="broken || index === collection.stations.length - 1" :aria-label="$t('collections.move_down') + ': ' + station.title" @click="moveStation(collection, index, 1)" />
              <UButton color="neutral" variant="ghost" icon="i-lucide-x" :disabled="broken" :aria-label="$t('collections.remove') + ': ' + station.title" @click="removeStation(collection, station.url)" />
            </li>
          </ol>
          <PanelListeningLibrary v-else-if="editingId !== collection.id" :ref="value => setPlayer(collection.id, value)" :collection-items="collection.stations" :collection-title="collection.name" />
          <p v-else class="text-sm text-[var(--radio-text-muted)]">{{ $t('collections.empty_stations') }}</p>
        </div>
      </details>
    </div>
    <UModal :open="Boolean(deleteId)" :title="$t('collections.confirm_delete')" :description="$t('collections.confirm_delete_description')" @update:open="value => { if (!value) deleteId = ''; }">
      <template #footer><div class="flex w-full justify-end gap-2"><UButton color="neutral" variant="outline" @click="deleteId = ''">{{ $t('collections.cancel') }}</UButton><UButton color="error" @click="deleteCollection">{{ $t('collections.delete') }}</UButton></div></template>
    </UModal>
    <UModal v-model:open="resetOpen" :title="$t('collections.reset_damaged')" :description="$t('collections.reset_description')">
      <template #footer><div class="flex w-full justify-end gap-2"><UButton color="neutral" variant="outline" @click="resetOpen = false">{{ $t('collections.cancel') }}</UButton><UButton color="error" @click="resetDamaged">{{ $t('collections.reset_damaged') }}</UButton></div></template>
    </UModal>
  </section>
</template>

<script setup lang="ts">
import { useListeningStore } from '~/stores/listening';
import { COLLECTIONS_KEY, COLLECTIONS_LIMIT, COLLECTION_STATIONS_LIMIT, COLLECTIONS_FILE_LIMIT, parseCollections, serializeCollections,
  addCollectionStation, moveCollectionStation, exportCollections, parseCollectionsFile } from '~/utils/personal-collections.mjs';
import { parseLibraryStationPath } from '~/utils/library-card-playback.mjs';

type Station = { url: string; title: string; image: string; countryKey?: string };
type Collection = { id: string; name: string; stations: Station[] };
const { t } = useI18n();
const listening = useListeningStore();
const { index, load, error: indexError } = useStationSearchIndex();
const collections = ref<Collection[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
const newName = ref(''); const renameId = ref(''); const renameName = ref(''); const deleteId = ref(''); const editingId = ref('');
const chosen = reactive<Record<string, string>>({});
const players = new Map<string, { playCollection: () => void }>();
const setPlayer = (id: string, value: unknown) => { if (value) players.set(id, value as { playCollection: () => void }); else players.delete(id); };
const playAll = async (collection: Collection) => { editingId.value = ''; await nextTick(); players.get(collection.id)?.playCollection(); };
const notice = ref(''); const broken = ref(false); const busy = ref(false); const resetOpen = ref(false); const rawBackup = ref('');
let importGeneration = 0;
const candidates = computed(() => [...new Map([...listening.library.favorites, ...listening.library.recent]
  .filter((s: Station) => parseLibraryStationPath(s.url) && !s.url.startsWith('/global-radio/')).map((s: Station) => [s.url, s])).values()] as Station[]);
const available = (collection: Collection) => candidates.value.filter(s => !collection.stations.some(item => item.url === s.url));
const readLocal = (raw: string | null) => { try { collections.value = parseCollections(raw); broken.value = false; rawBackup.value = ''; } catch { broken.value = true; rawBackup.value = raw || ''; notice.value = t('collections.corrupt'); } };
const sync = (event: StorageEvent) => { if (event.key === COLLECTIONS_KEY || event.key === null) readLocal(event.key === null ? null : event.newValue); };
onMounted(() => { listening.hydrate(); try { readLocal(localStorage.getItem(COLLECTIONS_KEY)); } catch { notice.value = t('collections.storage_error'); } window.addEventListener('storage', sync); });
onBeforeUnmount(() => { importGeneration++; window.removeEventListener('storage', sync); });
const save = () => { try { localStorage.setItem(COLLECTIONS_KEY, serializeCollections(collections.value)); return true; } catch { notice.value = t('collections.storage_error'); return false; } };
const createCollection = () => { const name = newName.value.trim(); if (broken.value || !name || collections.value.length >= COLLECTIONS_LIMIT) return; collections.value = [...collections.value, { id: crypto.randomUUID(), name, stations: [] }]; newName.value = ''; save(); };
const startRename = (collection: Collection) => { renameId.value = collection.id; renameName.value = collection.name; };
const renameCollection = (id: string) => { const name = renameName.value.trim(); if (!name || broken.value) return; collections.value = collections.value.map(c => c.id === id ? { ...c, name } : c); renameId.value = ''; save(); };
const deleteCollection = () => { if (broken.value) return; collections.value = collections.value.filter(c => c.id !== deleteId.value); deleteId.value = ''; save(); };
const replace = (value: Collection) => { collections.value = collections.value.map(c => c.id === value.id ? value : c); save(); };
const addStation = (collection: Collection) => { const station = candidates.value.find(s => s.url === chosen[collection.id]); if (!station || broken.value) return; replace(addCollectionStation(collection, station)); chosen[collection.id] = ''; };
const removeStation = (collection: Collection, url: string) => { if (!broken.value) replace({ ...collection, stations: collection.stations.filter(s => s.url !== url) }); };
const moveStation = (collection: Collection, index: number, direction: number) => { if (!broken.value) replace(moveCollectionStation(collection, index, direction)); };
const download = (contents: string, filename: string) => { const blob = new Blob([contents], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
const exportFile = () => download(exportCollections(collections.value), 'onair-collections.json');
const downloadBackup = () => download(rawBackup.value, 'onair-collections-damaged-backup.json');
const resetDamaged = () => { try { const current = localStorage.getItem(COLLECTIONS_KEY); if (!broken.value || current !== rawBackup.value) { readLocal(current); resetOpen.value = false; return; } localStorage.removeItem(COLLECTIONS_KEY); collections.value = []; broken.value = false; rawBackup.value = ''; notice.value = ''; resetOpen.value = false; } catch { notice.value = t('collections.storage_error'); } };
const importFile = async (event: Event) => {
  const input = event.target as HTMLInputElement; const file = input.files?.[0]; input.value = '';
  if (!file || broken.value) return;
  if (file.size > COLLECTIONS_FILE_LIMIT) { notice.value = t('collections.import_error'); return; }
  const generation = ++importGeneration;
  busy.value = true; notice.value = '';
  try {
    const parsed = parseCollectionsFile(await file.text());
    await load(); if (indexError.value || !index.value.length) throw new Error('catalog');
    if (generation !== importGeneration || broken.value) return;
    const byUrl = new Map(index.value.map((s: any) => [s.url, { url: s.url, title: s.station_name, image: s.station_image || '/brand/onair-mark.svg', countryKey: s.station_country }]));
    let missing = 0;
    const imported = parsed.map((c: { name: string; stations: string[] }) => c.stations.reduce((result: Collection, url: string) => {
      const station = byUrl.get(url);
      if (!station) { missing++; return result; }
      const next = addCollectionStation(result, station);
      if (next === result) missing++;
      return next;
    }, { id: crypto.randomUUID(), name: c.name, stations: [] }));
    const signature = (c: Collection) => JSON.stringify([c.name.toLocaleLowerCase(), c.stations.map(s => s.url)]);
    const seen = new Set(collections.value.map(signature));
    const additions = (imported as Collection[]).filter(c => { const key = signature(c); if (seen.has(key)) return false; seen.add(key); return true; });
    if (collections.value.length + additions.length > COLLECTIONS_LIMIT) throw new Error('limit');
    collections.value = [...collections.value, ...additions];
    if (save()) notice.value = t('collections.import_done', { count: additions.length, missing });
  } catch { if (generation === importGeneration) notice.value = t('collections.import_error'); } finally { if (generation === importGeneration) busy.value = false; }
};
</script>
