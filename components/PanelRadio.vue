<template>
  <div>
    <el-card class="box-card mar-card">
      <div slot="header" class="clearfix">
        <nuxt-link class="text-decoration-none" to="/viet-nam"><span>Việt Nam</span></nuxt-link>
      </div>

      <el-row :gutter="12">
        <el-col :xs="12" :sm="4" :md="4" :lg="3" :xl="3">
          <router-link to="/viet-nam/vov1">
            <el-image shape="square" :size="100" fit="cover" src="/img/viet-nam/vov1.png" lazy></el-image>
          </router-link>
        </el-col>
        <el-col :xs="12" :sm="4" :md="4" :lg="3" :xl="3">
          <router-link to="/viet-nam/vov2">
            <el-image shape="square" :size="100" fit="cover" src="/img/viet-nam/vov2.png" lazy></el-image>
          </router-link>
        </el-col>
        <el-col :xs="12" :sm="4" :md="4" :lg="3" :xl="3">
          <router-link to="/viet-nam/vov3">
            <el-image shape="square" :size="100" fit="cover" src="/img/viet-nam//vov3.png" lazy></el-image>
          </router-link>
        </el-col>
        <el-col :xs="12" :sm="4" :md="4" :lg="3" :xl="3">
          <router-link to="/viet-nam/vov4">
            <el-image shape="square" :size="100" fit="cover" src="/img/viet-nam/vov4.png" lazy></el-image>
          </router-link>
        </el-col>

        <el-col :xs="12" :sm="4" :md="4" :lg="3" :xl="3">
          <router-link to="/viet-nam/vov5">
            <el-image shape="square" :size="100" fit="cover" src="/img/viet-nam/vov5.png" lazy></el-image>
          </router-link>
        </el-col>
        <el-col :xs="12" :sm="4" :md="4" :lg="3" :xl="3">
          <router-link to="/viet-nam/vov-english">
            <el-image shape="square" :size="100" fit="cover" src="/img/viet-nam/vov-english.png" lazy></el-image>
          </router-link>
        </el-col>
        <el-col :xs="12" :sm="4" :md="4" :lg="3" :xl="3">
          <router-link to="/viet-nam/vov-gt-hcm">
            <el-image shape="square" :size="100" fit="cover" src="/img/viet-nam/vov-gt-tphcm.png" lazy></el-image>
          </router-link>
        </el-col>
        <el-col :xs="12" :sm="4" :md="4" :lg="3" :xl="3">
          <router-link to="/viet-nam/vov-giao-thong">
            <el-image shape="square" :size="100" fit="cover" src="/img/viet-nam/vov-giao-thong-ha-noi.png"
                      lazy></el-image>
          </router-link>
        </el-col>
      </el-row>

    </el-card>

    <el-card class="box-card mar-card">
      <div slot="header" class="clearfix">
        <nuxt-link class="text-decoration-none" to="/united-kingdom"><span>United Kingdom</span></nuxt-link>
      </div>

      <el-row :gutter="12">
        <el-col :xs="6" :sm="4" :md="4" :lg="3" :xl="3" class="pad-box-chanel">
          <nuxt-link to="/united-kingdom/heart-uk" class="mx-auto border-img chanel-is-active">
            <el-image class="align-middle img-center" shape="square" :size="100" fit="scale-down" src="/img/uk/heart.png"
                      lazy/>
          </nuxt-link>
        </el-col>
      </el-row>

    </el-card>
  </div>

</template>
