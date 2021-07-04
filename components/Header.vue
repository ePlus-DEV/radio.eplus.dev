<template>
  <div>
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
    >
      <el-menu-item index="1">
        <nuxt-link class="text-decoration-none" to="/">{{
          $t("navmenu.homepage")
        }}</nuxt-link>
      </el-menu-item>
      <el-menu-item>
        <el-link href="https://www.facebook.com/groups/radio.eplus.dev" target="_blank">{{
          $t("navmenu.group")
        }}</el-link>
      </el-menu-item>
      <el-menu-item index="2" @click="terms_and_conditions = true">
        <template slot="title">{{ $t("navmenu.terms") }}</template>
      </el-menu-item>
      <el-menu-item index="3" @click="contact_us = true">
        <template slot="title">{{ $t("navmenu.contact") }}</template>
      </el-menu-item>
      <el-menu-item>
        <el-link
          class="text-decoration-none"
          v-for="locale in availableLocales"
          :key="locale.code"
          @click.prevent.stop="$i18n.setLocale(locale.code)"
          >{{ $t("navmenu.language") }} {{ locale.name }}
          <!-- <el-image style="width: 50px" :src="locale.flag" fit="none"></el-image
        > --></el-link
        >
      </el-menu-item>
    </el-menu>

    <!-- End - Contact Us -->
    <el-drawer
      :title="$t('navmenu.contact')"
      :visible.sync="contact_us"
      direction="ttb"
      size="50%"
    >
      <el-main scroll-container>
        <p>
          {{ $t("contact.content") }}
        </p>
        <p>
          Facebook:
          <el-link href="https://fb.me/hoangsvit" target="_blank"
            >https://fb.me/hoangsvit</el-link
          >
        </p>
        <p>
          Group Facebook:
          <el-link href="https://www.facebook.com/groups/radio.eplus.dev" target="_blank"
            >https://www.facebook.com/groups/radio.eplus.dev</el-link
          >
        </p>
        <p>Email: contact@eplus.dev</p>
      </el-main>
    </el-drawer>
    <!-- End - Contact Us -->

    <!-- Begin - Terms & Conditions -->
    <el-drawer
      :title="$t('navmenu.terms')"
      :visible.sync="terms_and_conditions"
      direction="btt"
      size="50%"
    >
      <el-main scroll-container>
        {{ $t("terms.content") }}
      </el-main>
    </el-drawer>
    <!-- End - Terms & Conditions -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: "1",
      terms_and_conditions: false,
      contact_us: false,
    };
  },
  computed: {
    availableLocales() {
      return this.$i18n.locales.filter((i) => i.code !== this.$i18n.locale);
    },
  },
  methods: {
    handleSelect(key, keyPath) {
      if (keyPath === 1) {
        this.$router.push("/");
      }
      console.log(keyPath);
      console.log(key, keyPath);
    },
  },
};
</script>
