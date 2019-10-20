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
                /*script: [
                    {src: '/assets/custom/js/fix.js', body: true, ssr: true},
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

            this.$axios.get('assets/radio/viet-nam/data.json')
                .then((res) => {

                    if(res.data.hasOwnProperty(this.$route.params.name)){

                        const data = res.data[this.$route.params.name];

                        this.$notify.success({
                            title: 'Thành công',
                            message: 'Phát chương trình từ radio '+data.title,
                        });


                        var self = this;
                        self.title = this.$route.params.name.toUpperCase()+' - '+data.title
                        self.$emit('updateHead')

                        jwplayer.key = "YgtWotBOi+JsQi+stgRlQ3SK21W2vbKi/K2V86kVbwU=";
                        jwplayer("radio-player").setup({
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
