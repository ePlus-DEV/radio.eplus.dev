<template>
  <div>
    <el-card class="box-card mar-card">
      <div slot="header" class="clearfix">
        <el-badge value="Live" class="item">
          <el-button size="small">
            <template v-if="country !== undefined">
              {{ $t("panel.most_popular", { name: $t(country) }) }}
            </template>
            <template v-else>
              {{ stream }}
            </template>
          </el-button>
        </el-badge>
        <el-badge class="item">
          <div class="ticker"></div>
        </el-badge>
      </div>
      <!-- BEGIN - Player -->
      <audio id="player" preload="auto" autoplay width="100%"></audio>
      <!-- END - Player -->

      <!-- BEGIN - Playlist -->
      <template v-if="playlist !== undefined && playlist.length > 0">
        <div data-playlist="" class="playlist">
          <div
            data-playlist-current-song=""
            class="playlist__item playlist__item--current"
            :title="playlist[0].track_title + ' - ' + playlist[0].track_artist"
          >
            <img
              class="playlist__img"
              :src="playlist[0].track_image !== '' ? playlist[0].track_image : thumb"
              :alt="playlist[0].track_title + ' - ' + playlist[0].track_artist"
              height="42"
              importance="low"
              width="42"
            />
            <p class="playlist__metadata">
              <span class="playlist__song-name">{{ playlist[0].track_title }}</span
              ><span class="playlist__artist-name">{{ playlist[0].track_artist }}</span>
            </p>
            <span class="playlist__time">Live</span>
          </div>
          <ul
            data-playlist-previous-songs=""
            class="playlist__previous-songs custom-scrollbar"
            style="display: block"
          >
            <template v-for="(item, index) in playlist">
              <li
                class="playlist__item"
                title="BIG RED MACHINE - RENEGADE (feat. TAYLOR SWIFT)"
                v-bind:key="index"
                v-if="index >= 1"
              >
                <img
                  class="playlist__img"
                  :src="item.track_image !== '' ? item.track_image : thumb"
                  :alt="item.track_title + ' - ' + item.track_artist"
                  height="42"
                  importance="low"
                  width="42"
                />
                <p class="playlist__metadata">
                  <span class="playlist__song-name">{{ item.track_title }}</span
                  ><span class="playlist__artist-name">{{ item.track_artist }}</span>
                </p>
                <time class="playlist__time" :data-lang="$i18n.locale">{{
                  $moment.unix(item.track_played).fromNow()
                }}</time>
              </li>
            </template>
          </ul>
        </div>
      </template>
      <!-- END - Playlist -->
      <!-- BEGIN - Description -->
      <!-- <el-card v-if="this.description.length > 0"
        ><b> {{ $t("panel.description") }}:</b> {{ this.description }}</el-card
      > -->
      <!-- BEGIN - Description -->
    </el-card>
  </div>
</template>

<script>
export default {
  props: ["country", "stream", "playlist", "thumb"],
};
</script>
