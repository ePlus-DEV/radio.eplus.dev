<template>
  <vue-plyr
      ref="plyr"
      class="player-wrapper"
      :options="options"
    >
      <video
        preload="none"
        ref="video"
      ></video>
    </vue-plyr>
</template>

<script>
import Hls from 'hls.js'
import Plyr from 'plyr'
import 'vue-plyr/dist/vue-plyr.css'

export default {
  mounted() {
    const video = this.$refs.video
    const source = this.$refs.source.src
    const defaultOptions = {}
    if (!Hls.isSupported()) {
      video.src = source
    } else {
      const hls = new Hls()
      hls.loadSource(source)
      hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
        const availableQualities = hls.levels.map((l) => l.height)
        defaultOptions.quality = {
          default: availableQualities[0],
          options: availableQualities,
          forced: true,
          onChange: (e) => updateQuality(e),
        }
        defaultOptions.captions = {
          active: true,
          update: true,
          language: 'en',
        }
        const player = new Plyr(video, defaultOptions)
        player.on('languagechange', () => {
          setTimeout(() => (hls.subtitleTrack = player.currentTrack), 50)
        })
        hls.attachMedia(video)
        window.hls = hls
        window.player = player
      })
      function updateQuality(newQuality) {
        hls.levels.forEach((level, levelIndex) => {
          if (level.height === newQuality) {
            hls.currentLevel = levelIndex
          }
        })
      }
    }
  },
}
