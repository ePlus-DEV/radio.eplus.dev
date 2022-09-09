<template>
  <div class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3">
    <nuxt-content
      class="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto dark:text-white"
      :document="content"
    />
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: this.$t("navmenu.terms"),
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: "description",
          name: "description",
          content:
            "Radio Online Việt Nam, Singapore, Indonesia, Malaysia, Philippines, Pakistan, Hong Kong, ประเทศไทย, 中国, 台灣, Australia, New Zealand, Sri Lankā, Nepāla, United Kingdom, .v.v",
        },
      ],
    };
  },
  async asyncData({ $content }) {
    const content = await $content("privacy-policy").fetch();

    return {
      content,
    };
  },
};
</script>
<style lang="css" scoped>
ol,
ul {
  list-style: unset !important;
  margin-left: 20px !important;
}
</style>
