<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Hi {{ $auth.user.email }}!</span>
        <el-button type="danger" size="mini" @click="$auth.logout()">Sign out</el-button>
      </div>
      <div>Login....</div>
    </el-card>
  </div>
</template>
<script>
export default {
  middleware: "auth",
  head() {
    return {
      title: "Admin - Dashboard - ",
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
