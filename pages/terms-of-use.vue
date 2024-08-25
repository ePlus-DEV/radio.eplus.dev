<template>
  <div class="mockup-window border bg-base-300 dark:bg-gray-600 mb-2">
    <div class="px-4 py-16 bg-base-200 dark:bg-gray-200">
      <h1>{{ $t('navmenu.terms') }}</h1>
      <p class="mb-2">
        {{ $t('terms.content') }}
      </p>
      <div tabindex="0" class="collapse collapse-open collapse-arrow border border-base-300 bg-gray-100 rounded-box">
        <div class="collapse-title text-xl font-medium">{{ $t('terms.article_1.title') }}</div>
        <div class="collapse-content">
          <p>
            <strong>{{ $t('terms.article_1.line_1') }}</strong>
          </p>
          <p>
            {{ $t('terms.article_1.line_2') }}
          </p>
        </div>
      </div>
      <div tabindex="1" class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
        <div class="collapse-title text-xl font-medium">
          {{ $t('terms.article_2.title') }}
        </div>
        <div class="collapse-content">
          <p>
            {{ $t('terms.article_2.line_1') }}
          </p>
          <p>
            {{ $t('terms.article_2.line_2') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: this.$t("navmenu.terms"),
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Quy định sử dụng dịch vụ tại Radio.ePlus.DEV",
        },
      ],
    };
  },
};
</script>
<style lang="css" scoped>
h1 {
  font-size: x-large;
  font-weight: 900 !important;
  line-height: 2.25rem !important;
}
h2 {
  font-size: large;
  font-weight: 700 !important;
  line-height: 1.25rem !important;
}
ol,
ul {
  list-style: unset !important;
  margin-left: 40px !important;
}
</style>
