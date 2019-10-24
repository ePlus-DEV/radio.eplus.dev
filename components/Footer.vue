<template>
  <div>

    <el-divider><i class="el-icon-star-on"></i></el-divider>
    <el-row>
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="text-center">
        Copyright © {{ new Date().getFullYear() }} <a class="text-decoration-none" href="https://eplus.dev"
                                                      target="_blank">ePlus.DEV</a>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="text-center">
        <span class="align-middle">Serverless by</span>
        <el-image class="align-middle" shape="square" :size="100" fit="cover"
                  src="https://api.netlify.com/api/v1/badges/db14fce6-3e3b-499a-b805-30ece668ded5/deploy-status"
                  lazy></el-image>
      </el-col>
    </el-row>

  </div>
</template>
