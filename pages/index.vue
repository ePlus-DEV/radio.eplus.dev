<template>
  <div>




    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Việt Nam</span>
        <div class="grid-content bg-purple">
          <el-autocomplete
            class="inline-input"
            v-model="state1"
            :fetch-suggestions="querySearch"
            placeholder="Please Input"
            @select="handleSelect"
          ></el-autocomplete>
        </div>
      </div>

      <el-row :gutter="12">
        <el-col :xs="12" :sm="6" :md="4" :lg="3" :xl="1">
          <router-link to="/viet-nam/vov1">
          <el-image shape="square" :size="100" fit="cover" src="https://cdn.webrad.io/images/logos/radioonline-vn/vov1.png" lazy></el-image>
          </router-link>
        </el-col>
        <el-col :xs="12" :sm="6" :md="4" :lg="3" :xl="1">
          <el-image shape="square" :size="100" fit="cover" src="https://cdn.webrad.io/images/logos/radioonline-vn/vov2.png" lazy></el-image>
        </el-col>
        <el-col :xs="12" :sm="6" :md="4" :lg="3" :xl="1">
          <el-image shape="square" :size="100" fit="cover" src="https://cdn.webrad.io/images/logos/radioonline-vn/vov3.png" lazy></el-image>
        </el-col>
        <el-col :xs="12" :sm="6" :md="4" :lg="3" :xl="1">
          <el-image shape="square" :size="100" fit="cover" src="https://cdn.webrad.io/images/logos/radioonline-vn/vov-4.png" lazy></el-image>
        </el-col>
      </el-row>


    </el-card>
  </div>
</template>

<script>
    // import { videoPlayer } from 'vue-video-player'

    export default {
        head() {
            return {
                title: 'HomePage',
                meta: [
                    // hid is used as unique identifier. Do not use `vmid` for it as it will not work
                    {
                        hid: 'description',
                        name: 'description',
                        content: 'My custom description'
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
