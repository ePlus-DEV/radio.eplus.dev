<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <nuxt-link class="text-decoration-none" :to="'/'+slug">
        <el-image class="align-middle" :size="100" :src="'/img/icon/'+slug+'.png'" :alt="title_slug" fit="scale-down" lazy/>
        {{ title_slug }}
      </nuxt-link>
    </div>

    <el-row :gutter="12">
      <el-col :xs="6" :sm="4" :md="4" :lg="3" :xl="3" class="pad-box-chanel" v-for="(data, index) in results"
              :key="index">
        <nuxt-link :to="'/'+slug+'/'+index" class="mx-auto border-img" active-class="chanel-is-active">
          <el-image class="align-middle img-center" shape="square" :size="100" fit="scale-down" :src="data.features"
                    lazy/>
        </nuxt-link>
      </el-col>
    </el-row>

  </el-card>
</template>
<script>
    export default {
        data() {
            return {
                results: [],
                title_slug: 'United Kingdom',
                slug: 'united-kingdom'
            }
        },
        mounted() {
            this.$axios.get('/assets/radio/' + this.slug + '/data.json')
                .then((res) => {
                    this.results = res.data;
                })
        },
    }
</script>
