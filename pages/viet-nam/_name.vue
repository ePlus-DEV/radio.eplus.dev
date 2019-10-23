<template>
  <div>

    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">Trang Chủ</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/viet-nam' }">Việt Nam</el-breadcrumb-item>
      <el-breadcrumb-item>{{ name }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card" style="margin: 15px 0 15px 0">

      <div slot="header" class="clearfix">
        <el-badge value="Live" class="item">
          <el-button size="small">Radio.ePlus.DEV</el-button>
        </el-badge>
      </div>

      <audio id="player" preload="none" autoplay width="100%"></audio>

    </el-card>

    <PanelVietnam></PanelVietnam>

  </div>
</template>

<script>
    // To import only MediaElement class
    import 'mediaelement';
    import 'mediaelement/build/mediaelementplayer.min.css';
    import PanelVietNam from '~/components/PanelVietNam.vue'


    export default {
        head() {
            return {
                title: this.title,
                meta: [
                    // hid is used as unique identifier. Do not use `vmid` for it as it will not work
                    {
                        hid: 'description',
                        name: 'description',
                        content: 'Radio tại Việt Nam'
                    }
                ],
                /*script: [
                    {src: '/custom/js/player.js', body: false, ssr: false},
                ],*/
            }
        },
        data () {
            return {
                name: null,
                title: 'Radio tại Việt Nam'
            }
        },
        mounted () {

            this.$axios.get('/assets/radio/viet-nam/data.json')
                .then((res) => {

                    if(res.data.hasOwnProperty(this.$route.params.name)){

                        const data = res.data[this.$route.params.name];

                        this.$notify.success({
                            title: 'Thành công',
                            message: 'Phát từ radio '+data.title,
                        });

                        $('#radio-name').text(data.title);
                        this.name = data.title;
                        var self = this;
                        self.title = data.title+' - Radio tại Việt Nam - ';
                        self.$emit('updateHead');

                        var player = new MediaElementPlayer('player', {
                            features: ['playpause','progress','tracks','volume'],
                            enableKeyboard: true,
                            success: function(mediaElement) {
                                $('.mejs__time-rail').html('<div class="ticker radio-name-player"><ul><li>Phát từ Radio <strong>'+data.title+'</strong></li><li>Thể loại: <strong>'+data.category+'</strong></li><li>Quốc gia: <strong>Việt Nam</strong></li></ul></div>');
                                console.log("Player initialised");
                                $('.ticker').ticker();
                            }
                        });
                        player.setSrc(data.stream);

                    }else{

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
            PanelVietNam
        }
    }
</script>
