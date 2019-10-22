<template>
  <div>
    <el-card class="box-card" style="margin: 15px 0 15px 0">

      <div slot="header" class="clearfix">
        <el-badge value="Live" class="item">
          <el-button size="small" id="radio-name">Radio.ePlus.DEV</el-button>
        </el-badge>
      </div>

      <audio id='my-player' class='video-js' style="margin-top: 25px;" controls preload='auto' width="500" height="250" >

        <p class='vjs-no-js'>
          To view this video please enable JavaScript, and consider upgrading to a web browser that
          <a href='https://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a>
        </p>
      </audio>

    </el-card>

  </div>
</template>

<script>
    import "video.js/dist/video-js.css";
    import videojs from "video.js";
    import "videojs-contrib-hls";

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
        beforeRouteLeave(to, from, next){
            console.log("before route leave...");
            videojs('my-player').dispose();
            next();
        },
        beforeRouteUpdate(to, from, next){
            videojs('my-player').dispose();
            console.log("leave update...");
            next();
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
                            message: 'Phát chương trình từ radio '+data.title,
                        });

                        $('#radio-name').text(data.title);

                        var self = this;
                        self.title = this.$route.params.name.toUpperCase()+' - '+data.title;
                        self.$emit('updateHead');


                        var player = videojs('my-player', {
                            "autoplay": true,
                            "inactivityTimeout": 0,
                            "aspectRatio": "1:0",
                            "fluid": true,
                            "controlBar": {"fullscreenToggle": false},
                            sources: [{
                                type: data.type,
                                src: data.stream
                            }]
                        }).ready(function(){
                            console.log('VideoJS init');
                        });

                    }else{

                        this.$confirm('Chúng tôi muốn thông báo rằng trang bạn tìm không tồn tại!', 'Warning', {
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
    }
</script>
