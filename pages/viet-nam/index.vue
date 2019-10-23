<template>
  <div>

    <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/' }">Trang Chủ</el-breadcrumb-item>
    <el-breadcrumb-item>Việt Nam</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card" style="margin: 15px 0 15px 0">

      <div slot="header" class="clearfix">
        <el-badge value="Live" class="item">
          <el-button size="small" id="radio-name">Radio.ePlus.DEV</el-button>
        </el-badge>
        <el-badge class="item">
          <div class="ticker">
          </div>
        </el-badge>
      </div>

      <audio id="player" preload="auto" autoplay width="100%"></audio>

    </el-card>

    <PanelVietnam></PanelVietnam>


  </div>
</template>

<script>

    // To import only MediaElement class
    import 'mediaelement';
    import 'mediaelement/build/mediaelementplayer.min.css';
    import PanelVietnam from '~/components/PanelVietnam.vue'

    export default {
        head() {
            return {
                title: 'Trang Chủ Radio Việt Nam - ',
                meta: [
                    // hid is used as unique identifier. Do not use `vmid` for it as it will not work
                    {
                        hid: 'description',
                        name: 'description',
                        content: 'Radio Online được phát từ Việt Nam - VOV 1, VOV2, VOV3, VOV4, VOH, VOV Giao Thông'
                    }
                ],
                script: [
                    // {src: 'https://cdn.jwplayer.com/libraries/EmuDAgVd.js', body: false, ssr: false},
                    // {src: 'custom/js/player.js', body: false, ssr: false},
                    /*{src: 'https://cdnjs.cloudflare.com/ajax/libs/video.js/6.7.3/video.min.js', body: false, ssr: false},
                    {src: 'https://cdnjs.cloudflare.com/ajax/libs/videojs-contrib-hls/5.14.1/videojs-contrib-hls.js', body: false, ssr: false},*/
                ],
            }
        },
        mounted() {
            this.$axios.get('/assets/radio/favorite/data.json')
                .then((res) => {

                    const data = res.data;

                    this.$notify.success({
                        title: 'Thành công',
                        message: 'Phát từ Radio '+data['title'],
                    });

                    $('#radio-name').text(data['title']);

                    var player = new MediaElementPlayer('player', {
                        features: ['playpause','progress','tracks','volume'],
                        enableKeyboard: true,
                        success: function(mediaElement) {
                            $('.mejs__time-rail').html('<div class="ticker radio-name-player"><ul><li>Phát từ Radio <strong>'+data['title']+'</strong></li><li>Tần số: <strong>'+data['frequency']+'</strong></li><li>Quốc gia: <strong>'+data['countries']+'</strong></li></ul></div>');
                            console.log("Player initialised");
                            $('.ticker').ticker();
                        }
                    });
                    player.setSrc(data['stream']);

                })
        },
        components: {
            PanelVietnam
        }
    }
</script>

<style>
  .container {
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .title {
    font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    display: block;
    font-weight: 300;
    font-size: 100px;
    color: #35495e;
    letter-spacing: 1px;
  }

  .subtitle {
    font-weight: 300;
    font-size: 42px;
    color: #526488;
    word-spacing: 5px;
    padding-bottom: 15px;
  }

  .links {
    padding-top: 15px;
  }

  .ticker {
    width: 500px;
    margin: 10px auto;
  }
  /* The HTML list gets replaced with a single div,
     which contains the active ticker item, so you
     can easily style that as well */
  .ticker div {
    display: inline-block;
    word-wrap: break-word;
  }
</style>
