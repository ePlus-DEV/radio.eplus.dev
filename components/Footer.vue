<template>
  <div style="margin-bottom: 40px">
    <el-divider><i class="el-icon-star-on"></i></el-divider>
    <el-row>
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="text-center">
        Copyright © {{ new Date().getFullYear() }}
        <a class="text-decoration-none" href="https://eplus.dev" target="_blank"
          >ePlus.DEV</a
        >
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="text-center">
        <span class="align-middle">Serverless by</span>
        <el-image
          class="align-middle"
          shape="square"
          :size="100"
          fit="cover"
          src="https://api.netlify.com/api/v1/badges/d0726bb7-9dfd-4e34-98d0-1cf2dcd52bbb/deploy-status"
          lazy
        ></el-image>
      </el-col>
    </el-row>
  </div>
</template>
