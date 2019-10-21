<template>
  <div>

  </div>
</template>

<script>
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
                script: [
                    {src: '/custom/js/player.js', body: false, ssr: false},
                ],
            }
        },
        data () {
            return {
                name: null,
                title: 'Radio tại Việt Nam'
            }
        },
        mounted () {

            myPlayer.dispose();

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

                        $('#radio-player').html("<audio id='my-player' class='video-js' style=\"margin-top: 25px\" autoplay controls preload='auto' width=\"500\" height=\"250\" data-setup='{\n" +
                            "            \"inactivityTimeout\": 0,\n" +
                            "            \"aspectRatio\": \"1:0\",\n" +
                            "            \"fluid\": true,\n" +
                            "            \"controlBar\": {\"fullscreenToggle\": false},\n" +
                            "            \"language\":\"vi\"\n" +
                            "           }'>\n" +
                            "        <source src='"+data.stream+"' type='"+data.type+"' />\n" +
                            "\n" +
                            "        <p class='vjs-no-js'>\n" +
                            "          To view this video please enable JavaScript, and consider upgrading to a web browser that\n" +
                            "          <a href='https://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a>\n" +
                            "        </p>\n" +
                            "      </audio>");

                        // jwplayer.key = "YgtWotBOi+JsQi+stgRlQ3SK21W2vbKi/K2V86kVbwU=";
                        /*jwplayer("radio-player").setup({
                            width: "100%",
                            height: "45",
                            localization: {
                                liveBroadcast: "Đài "+data.title
                            },
                            "playlist": [{
                                "sources": [{
                                    "default": false,
                                    "file": data.stream,
                                    "type": "hls",
                                    "label": "0"
                                }]
                            }],
                            "primary": "html5",
                            "hlshtml": true,
                            "autostart": true,
                            "androidhls": true,
                            "skin": {
                                name:"thin"
                            }
                        });*/

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
