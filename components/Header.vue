<template>
  <div>
    <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
      <el-menu-item index="1">
        <nuxt-link class="text-decoration-none" to="/">
        <!--<template slot="title">-->Trang Chủ<!--</template>-->
        </nuxt-link>
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
        <p>Chúng tôi luôn ghi nhận mọi đóng góp ý kiến hoặc đóng góp thêm link stream nhằm đa dạng hoá các kênh Radio trên website. Mọi đóng góp vui lòng liên hệ contact bên dưới. Cảm ơn các bạn.</p>
        <p>FB: <a target="_blank" href="https://fb.me/hoangsvit">https://fb.me/hoangsvit</a></p>
        <p>Email: contact@eplus.dev</p>
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
        Các kênh Radio đều dẫn nguồn từ các nhà đài trên khắp thế giới, chúng tôi không chịu trách nhiệm nội dung của các kênh Radio.
        Vui lòng cân nhắc trước khi dự định làm theo một điều gì đó.
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
                if(keyPath === 1){
                    this.$router.push('/')
                }
                console.log(keyPath);
                console.log(key, keyPath);
            }
        }
    }
</script>
