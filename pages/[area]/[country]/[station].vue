<template>
  <div>
    <!-- BEGIN - Breadcrumbs -->
    <Breadcrumbs
      :area="Array.isArray(area) ? area[0] : area"
      :level_1="i18n"
      :level_1_slug="Array.isArray(slug) ? slug[0] : slug"
      :level_2="streamName"
    />
    <!-- END - Breadcrumbs -->

    <!-- BEGIN - Player -->
    <Player
      :country="i18n"
      :song="song"
      :program="program"
      :info="info"
      :playlist="data"
      :current="current"
      :streamName="streamName"
      :streamUrl="streamUrl"
      :thumb="thumb"
    ></Player>
    <!-- END - Player -->

    <!-- BEGIN - Lyric -->
    <button
      class="fixed left-4 bottom-2 uppercase text-sm px-4 py-3 bg-gray-900 text-white rounded-full dark:bg-red-700 z-50"
      @click="lyric_popup = !lyric_popup"
      v-show="slug == 'viet-nam'"
    >
      <fa
        :icon="['far', 'list-music']"
        class="text-white fill-current h-5 w-5"
      />
    </button>
    <div
      class="fixed left-0 bottom-2 z-40"
      :class="lyric_popup ? '' : 'hidden'"
    >
      <div
        class="fixed sm:left-4 bottom-20 rounded-lg bg-white shadow-2xl w-full sm:w-1/2 xl:w-1/4 max-w-[450px] overflow-hidden dark:bg-gray-700 dark:text-white"
      >
        <!-- Text -->
        <div class="">
          <div class="relative overflow-hidden px-8 pt-8">
            <div
              width="80"
              height="77"
              class="absolute -top-10 -right-10 text-yellow-500"
            >
              <svg
                width="120"
                height="119"
                viewBox="0 0 120 119"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  opacity="0.3"
                  d="M6.38128 49.1539C3.20326 32.893 13.809 17.1346 30.0699 13.9566L70.3846 6.07751C86.6455 2.89948 102.404 13.5052 105.582 29.7661L113.461 70.0808C116.639 86.3417 106.033 102.1 89.7724 105.278L49.4577 113.157C33.1968 116.335 17.4384 105.729 14.2604 89.4686L6.38128 49.1539Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div class="text-2xl flex flex-col pb-4">
              <small id="song"></small>
              <span class="text-3xl font-bold"> {{ $t("panel.lyric") }} </span>
            </div>
            <div class="pb-4 overflow-y-auto h-64" id="lyric">
              <!-- skipcq: JS-0693 -->
              <span v-html="lyric" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- END - Lyric -->

    <!-- BEGIN - PanelStation -->
    <PanelStation @updateData="handleDataFromChild" />
    <!-- END - PanelStation -->
  </div>
</template>

<script setup lang="ts">
import type { AudioSrc, AudioMimeType } from "vidstack";
const $store = useMainStore();
const dayjs = useDayjs();
const route = useRoute();
const { t } = useI18n();
const config = useRuntimeConfig();
const slug = ref(route.params.country);
const area = ref(route.params.area);
const i18n = ref(
  `world.${String(area.value).replace(/-/g, "_")}.${String(slug.value).replace(/-/g, "_")}`,
);
const timeZone = ref($store.getTimezone);
const title = ref<string | undefined>(t(i18n.value));
const streamName = ref("");
interface ProgramItem {
  // Define the properties of ProgramItem based on the structure of resDataValue.data.items
  encodeId: string;
  // Add other properties as needed
}

const program = ref<ProgramItem[]>([]);
const song = ref<Song>({});
const info = ref([]);
const current = ref({});
interface Track {
  track_title: string;
  track_artist: string;
  // Add other properties as needed
}
interface CurrentMedia {
  title: string;
  artists: string;
  hasLyric: boolean;
  encodeId: string;
}

interface Song {
  currentMedia?: CurrentMedia;
  // Add other properties as needed
}

const thumb = ref("");

useHead({
  title: title.value,
});

const data = ref<Track[]>([]);
const polling_schedule = ref<ReturnType<typeof setInterval> | null>(null);
const polling_song = ref<ReturnType<typeof setInterval> | null>(null);
const lyric_popup = ref(false);
const lyric = ref(t("panel.updating"));
// const timezone = ref("Asia/Ho_Chi_Minh");

const streamUrl = ref<AudioSrc>({ src: "", type: "audio/mpeg" });

/**
 * Fetches the lyrics for the given song ID.
 * @param {string} id - The ID of the song to fetch lyrics for.
 */
const fetchLyric = async (id: string) => {
  try {
    const { data: resData } = await useFetch(
      `${config.public.apiZingGetLyric}${id}&time=${dayjs().tz(timeZone.value).unix()}`,
    );
    const resDataValue = resData.value as {
      err: number;
      data: { sentences: { words: { data: string }[] }[] };
    };
    if (resDataValue.err === 0 && resDataValue.data.sentences) {
      lyric.value = resDataValue.data.sentences
        .map(
          (sentence: { words: { data: string }[] }) =>
            `<p class="pb-1">${sentence.words.map((word: { data: string }) => word.data).join(" ")}</p>`,
        )
        .join("");
    } else {
      lyric.value = t("panel.no_lyric");
    }
  } catch (error) {
    lyric.value = t("panel.no_lyric");
  }
};

/**
 * Fetches the current song data from the given URL.
 * @param {string} url - The URL to fetch the song data from.
 */
const fetchDetail = async (url: string) => {
  try {
    const { data: resData } = await useFetch(
      url + dayjs().tz(timeZone.value).unix(),
    );
    const resDataValue = resData.value as { err: number; data: Song };
    if (resDataValue.err === 0) {
      song.value = resDataValue.data;
      const currentMedia = song.value?.currentMedia;
      if (currentMedia) {
        document.title = `${currentMedia.title} - ${currentMedia.artists} | ${title.value}`;
        if (currentMedia.hasLyric) {
          fetchLyric(currentMedia.encodeId);
        } else {
          lyric.value = t("panel.no_lyric");
        }
      }
    }
    if (polling_song.value !== null) {
      clearTimeout(polling_song.value);
    }
    polling_song.value = setInterval(() => {
      fetchDetail(url);
    }, 60000);
  } catch (error) {
    console.error(error);
  }
};

/**
 * Fetches the schedule data from the given URL.
 * @param {string} url - The URL to fetch the schedule data from.
 */
const fetchSchedule = async (url: string) => {
  try {
    const { data: resData } = await useFetch(
      url + dayjs().tz(timeZone.value).unix(),
    );
    const resDataValue = resData.value as {
      err: number;
      data: { items: ProgramItem[] };
    };

    if (resDataValue.err === 0 && slug.value === "viet-nam") {
      document.title = `${streamName.value} - ${title.value}`;
      program.value = resDataValue.data.items;
      // Fetch the current song data from the first program item
      const firstProgramItem = resDataValue.data.items[0];
      fetchDetail(
        `${config.public.apiZingLiveStreamProgramDetail}${firstProgramItem.encodeId}&time=`,
      );
    } else {
      const resDataSuccess = resData.value as { success: boolean };
      if (resDataSuccess.success) {
        data.value = (resData.value as { result: Track[] }).result;
      }
      if (data.value.length > 0) {
        const firstTrack = data.value[0];
        document.title = `${firstTrack.track_title} - ${firstTrack.track_artist} | ${title.value}`;
      }
    }
    if (polling_schedule.value !== null) {
      clearTimeout(polling_schedule.value);
    }
    polling_schedule.value = setInterval(() => {
      fetchSchedule(url);
    }, 60000);
  } catch (error) {
    console.error(error);
  }
};

// skipcq: JS-0323
const handleDataFromChild = (data: any) => {
  streamName.value = data.station_name;
  streamUrl.value = {
    src: data.cros
      ? `${config.public.corsServer}${data.station_stream}`
      : data.station_stream,
    type: data.type as AudioMimeType,
  };
  thumb.value = data.station_image;
  document.title = `${streamName.value} - ${title.value}`;

  if (data.station_schedule !== undefined) {
    fetchSchedule(data.station_schedule);
  }
};

onBeforeUnmount(() => {
  clearTimeout(polling_schedule.value as unknown as number);
  clearTimeout(polling_song.value as unknown as number);
});
</script>
