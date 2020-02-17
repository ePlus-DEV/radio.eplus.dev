<template>
  <div>

    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">Trang Chủ</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/'+slug }">{{ title_slug }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card" style="margin: 15px 0 15px 0">

      <div slot="header" class="clearfix">
        <el-badge value="Live" class="item">
          <el-button size="small">Radio.ePlus.DEV</el-button>
        </el-badge>
      </div>

      <audio id="player" preload="none" autoplay width="100%"></audio>

      <div class="player-errors"></div>

    </el-card>

    <PanelUnitedKingdom></PanelUnitedKingdom>

  </div>
</template>

<script>
  // To import only MediaElement class
  import 'mediaelement';
  import 'mediaelement/build/mediaelementplayer.min.css';
  import PanelUnitedKingdom from '~/components/PanelAustralia.vue'

  export default {
    head() {
      return {
        title: this.title,
        meta: [
          // hid is used as unique identifier. Do not use `vmid` for it as it will not work
          {
            hid: 'description',
            name: 'description',
            content: 'Radio at Australia'
          }
        ]
      }
    },
    data() {
      return {
        name: null,
        title: 'Radio tại ' + this.title_slug,
        title_slug: 'Australia',
        slug: 'australia'
      }
    },
    mounted() {

      this.$axios.get('/assets/radio/' + this.slug + '/data.json')
        .then((res) => {

          if (res.data.hasOwnProperty(this.$route.params.name)) {

            const data = res.data[this.$route.params.name];

            $('#radio-name').text(data.title);
            this.name = data.title;
            var self = this;
            self.title = data.title + ' - Radio tại ' + this.title_slug + ' - ';
            self.$emit('updateHead');

            var notify = this.$notify;

            var player = new MediaElementPlayer('player', {
              features: ['playpause', 'progress', "airplay", "chromecast", 'volume'],
              enableKeyboard: true,
              error: true,
              readyState: true,
              success: function (mediaElement) {

                mediaElement.addEventListener('canplay', function () {
                  notify.success({
                    title: 'Thành công',
                    message: 'Phát từ radio ' + data.title,
                  });

                  $('.mejs__time-rail').html('<div class="ticker radio-name-player"><ul><li>Phát từ Radio <strong>' + data.title + '</strong></li><li>Thể loại: <strong>' + data.category + '</strong></li><li>Quốc gia: <strong>Australia</strong></li></ul></div>');
                  $('.ticker').ticker();

                }, false);

                mediaElement.addEventListener('error', function () {

                  notify.error({
                    title: 'Thất bại',
                    message: 'Tải không thành công radio ' + data.title,
                  });

                }, false);

                console.log("Player initialised");
              }
            });
            player.setSrc(data.stream);

          } else {

            this.$confirm('Chúng tôi muốn thông báo rằng trang bạn tìm, không tồn tại!', 'Warning', {
              confirmButtonText: 'Quay lại',
              showCancelButton: false,
              closeOnPressEscape: false,
              closeOnClickModal: false,
              showClose: false,
              type: 'warning',
              center: true
            }).then(() => {
              this.$router.push('/')
            }).catch(() => {
              this.$message({
                type: 'info',
                message: 'Delete canceled'
              });
            });

          }

        })

    },
    components: {
      PanelUnitedKingdom
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
