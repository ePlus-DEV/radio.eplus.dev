<template>
  <div>
    <el-card class="box-card" style="margin: 15px 0 15px 0">
      <div slot="header" class="clearfix">
        <el-badge value="Live" class="item">
          <el-button size="small">{{ $config.Site_Name }}</el-button>
        </el-badge>
      </div>

      <audio id="player" preload="auto" autoplay width="100%"></audio>
    </el-card>
  </div>
</template>
