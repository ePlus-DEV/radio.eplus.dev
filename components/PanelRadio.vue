<template>
  <div>
    <el-card class="box-card mar-card">
      <div slot="header" class="clearfix">
        <span>Asia</span>
      </div>

      <el-row type="flex" justify="center">
        <el-col :xs="3" :sm="3" :md="3" :lg="3" :xl="3" align="middle">
          <nuxt-link class="text-decoration-none align-middle" to="/viet-nam">
            <el-image class="align-middle" :size="100" src="/img/icon/viet-nam.png" alt="Việt Nam"
                      fit="no" lazy/>
            <span class="align-middle">Việt Nam</span>
          </nuxt-link>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="box-card mar-card">
      <div slot="header" class="clearfix">
        <nuxt-link class="text-decoration-none" to="/united-kingdom">
          <el-image class="align-middle" :size="100" src="/img/icon/united-kingdom.png" alt="United Kingdom"
                    fit="scale-down" lazy/>
          United Kingdom
        </nuxt-link>
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
