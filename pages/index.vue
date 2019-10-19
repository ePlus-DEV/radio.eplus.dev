<template>
  <div>
    <el-container>

    </el-container>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Việt Nam</span>
      </div>

      <el-row :gutter="20">
        <el-col :span="6">
          <div class="grid-content bg-purple">
            <el-autocomplete
              class="inline-input"
              v-model="state1"
              :fetch-suggestions="querySearch"
              placeholder="Please Input"
              @select="handleSelect"
            ></el-autocomplete>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple">11</div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple">11</div>
        </el-col>
        <el-col :span="6">
          <div class="grid-content bg-purple">222</div>
        </el-col>
      </el-row>


    </el-card>
  </div>
</template>

<script>
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
                    {src: '/assets/custom/js/fix.js', body: true, ssr: true},
                ],
            }
        },
        data() {
            return {
                links: [],
                state1: '',
                state2: ''
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
        components: {}
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
