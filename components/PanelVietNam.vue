<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>Việt Nam</span>
    </div>

    <el-row :gutter="12">
      <el-col :xs="6" :sm="4" :md="4" :lg="3" :xl="3" class="pad-box-chanel" v-for="(data, index) in results" :key="index">
        <nuxt-link :to="'/viet-nam/'+index" class="mx-auto border-img" active-class="chanel-is-active">
          <el-image class="align-middle img-center" shape="square" :size="100" fit="scale-down" :src="data.features" lazy/>
        </nuxt-link>
      </el-col>
    </el-row>


  </el-card>
</template>
<script>
    export default {
        head() {
            return {
                title: 'Trang Chủ - ',
                meta: [
                    // hid is used as unique identifier. Do not use `vmid` for it as it will not work
                    {
                        hid: 'description',
                        name: 'description',
                        content: 'Radio Online Việt Nam, Singapore, Indonesia, Malaysia, Philippines, Pakistan, Hong Kong, ประเทศไทย, 中国, 台灣, Australia, New Zealand, Sri Lankā, Nepāla, United Kingdom, .v.v'
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
        data(){
            return {
                results: []
            }
        },
        mounted() {
            this.$axios.get('/assets/radio/viet-nam/data.json')
                .then((res) => {

                    this.results = res.data;

                })
        },
    }
</script>
