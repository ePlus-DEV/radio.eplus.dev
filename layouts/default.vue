<template>
  <div>
    <!-- START HEADER -->

    <TheHeader />

    <!-- END HEADER -->

    <div class="container mx-auto px-4 mt-20" scroll-container>
      <!-- START CONTENT -->

      <nuxt />

      <!-- End CONTENT -->

      <!-- START FOOTER -->

      <TheFooter />

      <!-- END FOOTER -->
    </div>
  </div>
</template>

<script>
export default {
  head() {
    return this.$nuxtI18nHead({ addSeoAttributes: true });
  },
};
</script>
