<template>
  <div>
    <el-card class="box-card mar-card">
      <div slot="header" class="clearfix">
        <el-badge value="Live" class="item">
          <el-button size="small">
            <template v-if="country !== undefined">
              {{ $t("panel.most_popular", { name: $t(country) }) }}
            </template>
            <template v-else>
              {{ stream }}
            </template>
          </el-button>
        </el-badge>
        <el-badge class="item">
          <div class="ticker"></div>
        </el-badge>
      </div>
      <!-- BEGIN - Player -->
      <audio id="player" preload="auto" autoplay width="100%"></audio>
      <!-- END - Player -->

      <!-- BEGIN - Description -->
      <!-- <el-card v-if="this.description.length > 0"
        ><b> {{ $t("panel.description") }}:</b> {{ this.description }}</el-card
      > -->
      <!-- BEGIN - Description -->
    </el-card>
  </div>
</template>

<script>
export default {
  props: ["country", "stream"],
};
</script>
