<template>
  <div>
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-menu-item index="1">
        <nuxt-link class="text-decoration-none" to="/">Trang Chủ</nuxt-link>
      </el-menu-item>
      <el-menu-item index="2" @click="terms_and_conditions = true">
        <template slot="title">Điều khoản</template>
      </el-menu-item>
      <el-menu-item index="3" @click="contact_us = true">
        <template slot="title">Liên Hệ</template>
      </el-menu-item>
    </el-menu>

    <!-- End - Contact Us -->
    <el-drawer
      title="Liên Hệ"
      :visible.sync="contact_us"
      direction="ttb"
      size="50%">
      <el-main scroll-container>
        Đang cập nhật...
      </el-main>
    </el-drawer>
    <!-- End - Contact Us -->

    <!-- Begin - Terms & Conditions -->
    <el-drawer
      title="Điều khoản"
      :visible.sync="terms_and_conditions"
      direction="btt"
      size="50%">
      <el-main scroll-container>
        Đang cập nhật...
      </el-main>
    </el-drawer>
    <!-- End - Terms & Conditions -->
  </div>
</template>
<script>
    export default {
        data() {
            return {
                activeIndex: '1',
                terms_and_conditions: false,
                contact_us: false
            };
        },
        methods: {
            handleSelect(key, keyPath) {
                console.log(key, keyPath);
            }
        }
    }
</script>
