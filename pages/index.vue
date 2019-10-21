<template>
  <div>

    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Việt Nam</span>
      </div>

      <el-row :gutter="12">
        <el-col :xs="12" :sm="4" :md="4" :lg="3" :xl="3">
          <router-link to="/viet-nam/vov1">
          <el-image shape="square" :size="100" fit="cover" src="https://cdn.webrad.io/images/logos/radioonline-vn/vov1.png" lazy></el-image>
          </router-link>
        </el-col>
        <el-col :xs="12" :sm="4" :md="4" :lg="3" :xl="3">
          <router-link to="/viet-nam/vov2">
          <el-image shape="square" :size="100" fit="cover" src="https://cdn.webrad.io/images/logos/radioonline-vn/vov2.png" lazy></el-image>
          </router-link>
        </el-col>
        <el-col :xs="12" :sm="4" :md="4" :lg="3" :xl="3">
          <router-link to="/viet-nam/vov3">
          <el-image shape="square" :size="100" fit="cover" src="https://cdn.webrad.io/images/logos/radioonline-vn/vov3.png" lazy></el-image>
          </router-link>
        </el-col>
        <el-col :xs="12" :sm="4" :md="4" :lg="3" :xl="3">
          <router-link to="/viet-nam/vov4">
          <el-image shape="square" :size="100" fit="cover" src="https://cdn.webrad.io/images/logos/radioonline-vn/vov-4.png" lazy></el-image>
          </router-link>
        </el-col>

        <el-col :xs="12" :sm="4" :md="4" :lg="3" :xl="3">
          <router-link to="/viet-nam/vov5">
            <el-image shape="square" :size="100" fit="cover" src="https://cdn.webrad.io/images/logos/radioonline-vn/vov5.png" lazy></el-image>
          </router-link>
        </el-col>
        <el-col :xs="12" :sm="4" :md="4" :lg="3" :xl="3">
          <router-link to="/viet-nam/vov-english">
            <el-image shape="square" :size="100" fit="cover" src="https://cdn.webrad.io/images/logos/radioonline-vn/vov-english.png" lazy></el-image>
          </router-link>
        </el-col>
        <el-col :xs="12" :sm="4" :md="4" :lg="3" :xl="3">
          <router-link to="/viet-nam/vov-gt-hcm">
            <el-image shape="square" :size="100" fit="cover" src="https://cdn.webrad.io/images/logos/radioonline-vn/vov-gt.png" lazy></el-image>
          </router-link>
        </el-col>
        <el-col :xs="12" :sm="4" :md="4" :lg="3" :xl="3">
          <router-link to="/viet-nam/vov-giao-thong">
            <el-image shape="square" :size="100" fit="cover" src="https://cdn.webrad.io/images/logos/radioonline-vn/vov-giao-thong.png" lazy></el-image>
          </router-link>
        </el-col>
      </el-row>

    </el-card>
  </div>
</template>

<script>

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
                    {src: 'custom/js/player.js', body: false, ssr: false},

                ],
            }
        },
        data() {
            return {
                links: [],
                state1: '',
                state2: '',
            };
        },
        methods: {
            querySearch(queryString, cb) {
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
            }
        },
        mounted() {
            this.links = this.loadAll();
            $('#radio-name').text('Heart London');


            if (typeof variable !== 'undefined') {
                myPlayer.dispose();
                $('#radio-player').html('');
            }

            $('#radio-player').html("<audio id='my-player' class='video-js' style=\"margin-top: 25px\" autoplay controls preload='auto' width=\"500\" height=\"250\" data-setup='{\n" +
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
                "      </audio>");

            // myPlayer.src({type: "audio/mpeg", src: "https://media-ice.musicradio.com/HeartLondon.m3u"});


            /*jwplayer.key = "YgtWotBOi+JsQi+stgRlQ3SK21W2vbKi/K2V86kVbwU=";
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
            });*/
        },
        components: {
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
