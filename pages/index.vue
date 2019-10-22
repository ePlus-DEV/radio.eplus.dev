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
                title: 'Trang Chủ - Radio Online Việt Nam',
                meta: [
                    // hid is used as unique identifier. Do not use `vmid` for it as it will not work
                    {
                        // hid: 'description',
                        // name: 'description',
                        content: 'VOV Giao Thông, VOV1, VOV2, VOV3, VOV4 - Radio Online Việt Nam'
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
        beforeRouteLeave(to, from, next){
            console.log("before route leave...")
            videojs('my-player').dispose();
            next();
        },
        mounted() {
            this.$axios.get('/assets/radio/favorite/data.json')
                .then((res) => {

                    const data = res.data;

                    this.$notify.success({
                        title: 'Thành công',
                        message: 'Phát chương trình từ radio '+data['title'],
                    });

                    var player = videojs('my-player', {
                        "autoplay": true,
                        "inactivityTimeout": 0,
                        "aspectRatio": "1:0",
                        "fluid": true,
                        "controlBar": {"fullscreenToggle": false},
                        sources: [{
                            type: data['type'],
                            src: data['stream']
                        }]
                    }).ready(function(){
                        console.log('VideoJS init');
                    });

                })
        },
        data() {
            return {
                streamLink: null,
                typeStream: null
                /*links: [],
                state1: '',
                state2: '',*/
            };
        },
        methods: {
            /*querySearch(queryString, cb) {
                var links = this.links;
                var results = queryString ? links.filter(this.createFilter(queryString)) : links;
                // call callback function to return suggestions
                cb(results);
            },
            createFilter(queryString) {
                return (link) => {
                    return (link.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
                };
            },
            loadAll() {
                return [
                    { "value": "vue", "link": "https://github.com/vuejs/vue" },
                    { "value": "element", "link": "https://github.com/ElemeFE/element" },
                    { "value": "cooking", "link": "https://github.com/ElemeFE/cooking" },
                    { "value": "mint-ui", "link": "https://github.com/ElemeFE/mint-ui" },
                    { "value": "vuex", "link": "https://github.com/vuejs/vuex" },
                    { "value": "vue-router", "link": "https://github.com/vuejs/vue-router" },
                    { "value": "babel", "link": "https://github.com/babel/babel" }
                ];
            },
            handleSelect(item) {
                console.log(item);
            }*/
        },
        /*mounted() {
            // this.links = this.loadAll();
            // $('#radio-name').text('Heart London');

            /!*window.addEventListener('load', () => {
                // run after everything is in-place
                videojs("my-player", {}, function(){
                    // Player (this) is initialized and ready.
                    console.log('testttttttttttt')
                });
            })*!/





            /!*if (typeof variable !== 'undefined') {
                myPlayer.dispose();
                $('#radio-player').html('');
            }*!/

            /!*$('#radio-player').html("<audio id='my-player' class='video-js' style=\"margin-top: 25px\" autoplay controls preload='auto' width=\"500\" height=\"250\" data-setup='{\n" +
                "            \"inactivityTimeout\": 0,\n" +
                "            \"aspectRatio\": \"1:0\",\n" +
                "            \"fluid\": true,\n" +
                "            \"controlBar\": {\"fullscreenToggle\": false},\n" +
                "            \"language\":\"vi\"\n" +
                "           }'>\n" +
                "        <source src='http://media-ice.musicradio.com:80/HeartLondon' type='audio/mpeg' />\n" +
                "\n" +
                "        <p class='vjs-no-js'>\n" +
                "          To view this video please enable JavaScript, and consider upgrading to a web browser that\n" +
                "          <a href='https://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a>\n" +
                "        </p>\n" +
                "      </audio>");*!/

            // myPlayer.src({type: "audio/mpeg", src: "https://media-ice.musicradio.com/HeartLondon.m3u"});


            /!*jwplayer.key = "YgtWotBOi+JsQi+stgRlQ3SK21W2vbKi/K2V86kVbwU=";
            jwplayer("radio-player").setup({
                width: "100%",
                height: "45",
                localization: {
                    liveBroadcast: "Đài VOV Giao Thông"
                },
                /!*"playlist": [{
                    "sources": [{
                        "default": false,
                        "file": "assets/radio/uk.data.rss",
                        // "file": "https://5a6872aace0ce.streamlock.net/nghevovgthn/vovgthn.stream_aac/playlist.m3u8",
                        "type": "hls",
                        "label": "0"
                    }]
                }],*!/
                "flashplayer":"//cdn.jsdelivr.net/jwplayer/5.10/player.swf",
                "playlist": "assets/radio/uk/data.rss",
                "primary": "html5",
                "hlshtml": true,
                "autostart": true,
                "androidhls": true,
                "skin": {
                    name:"thin"
                }
            });*!/
        },*/
        components: {
            // Player
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
</style>
