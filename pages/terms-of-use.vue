<template>
  <div class="mockup-window border bg-base-300 dark:bg-gray-600 mb-2">
    <div class="px-4 py-16 bg-base-200 dark:bg-gray-200">
      <h1>Term of use</h1>
      <p class="mb-2">
        Welcome to the website https://radio.eplus.dev ("Radio ePlus") a product by
        ePlus.DEV. Please carefully read the Agreement on provision and use of services on
        the Website https://radio.eplus.dev before you use the features on the "Radio ."
        Website ePlus.” Once registered, you have read, understood, accepted and complied
        with the terms below:
      </p>
      <div
        tabindex="0"
        class="collapse collapse-open collapse-arrow border border-base-300 bg-gray-100 rounded-box"
      >
        <div class="collapse-title text-xl font-medium">Article 1: Nonprofit</div>
        <div class="collapse-content">
          <p>
            <strong>We are committed to free forever, with no fees of any kind.</strong>
          </p>
          <p>
            We recognize the use of free content from all over the station, content
            developers from all over the world, so I wanted to spread this content to
            everyone.
          </p>
        </div>
      </div>
      <div
        tabindex="1"
        class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
      >
        <div class="collapse-title text-xl font-medium">
          Article 2: Digital Millennium Copyright Act
        </div>
        <div class="collapse-content">
          <p>
            <strong>Radio ePlus</strong> takes matters of Intellectual Property very
            seriously and is committed to meeting the needs of content owners while
            helping them manage publication of their content online. It should be noted
            that <strong>Radio ePlus</strong> is a radio station portal linking to third
            party websites by pop ups.
          </p>
          <p>
            Any content on these third party websites are the responsibility of those
            sites and not <strong>Radio ePlus</strong>. We have no knowledge of whether
            content on third party websites is or is not authorized by the content owner
            as that is a matter between the site that hosts the audio content and the
            content owner. <strong>Radio ePlus</strong> does not host any audio content on
            its servers or network.
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
