<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>{{
          !$auth.loggedIn
            ? "You're not authenticated yet"
            : "Now that you're authenticated"
        }}</span>
      </div>
      <template v-if="$auth.loggedIn">
        <div>Login....</div>
      </template>
      <template v-else>
        <div>
          Maybe you want to
          <el-button type="primary" size="small" @click="$auth.login()"
            >Sign in</el-button
          >
          and see what happens?
        </div>
      </template>
    </el-card>
  </div>
</template>
<script>
export default {
  head() {
    return {
      title: "Admin - Login - ",
      meta: [
        {
          hid: "description",
          name: "description",
          content:
            "Radio Online Việt Nam, Singapore, Indonesia, Malaysia, Philippines, Pakistan, Hong Kong, ประเทศไทย, 中国, 台灣, Australia, New Zealand, Sri Lankā, Nepāla, United Kingdom, .v.v",
        },
      ],
    };
  },
};
</script>
