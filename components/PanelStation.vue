<template>
  <!-- BEGIN - Station -->
  <div class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3">
    <div class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg">
      <h2 class="text-2xl dark:text-white">{{ $t("world.asia.name") }}</h2>
    </div>
    <div class="flex items-center justify-center">
      <div class="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-4 m-4">
        <template v-for="(data, index) in results">
          <nuxt-link
            :to="'/' + slug + '/' + index"
            v-bind:key="index"
            class="tooltip border"
            :data-tip="$t(data.title)"
            active-class="active border-red-700"
            :class="[
              isRouteActive(index)
                ? 'border-red-700'
                : 'border-base-300 dark:border-gray-600 hover:border-purple-700 dark:hover:border-white',
            ]"
          >
            <img
              :src="data.features"
              :alt="$t(data.title)"
              class="p-0 sm:p-1 md:p-5 lg:p-10"
            />
          </nuxt-link>
        </template>
      </div>
    </div>
  </div>
  <!-- END - Station -->
</template>

<script>
export default {
  props: ["area", "slug", "i18n"],
  data() {
    return {
      results: [],
    };
  },
  mounted() {
    this.$axios
      .get("/assets/radio/" + this.area + "/" + this.slug + ".json")
      .then((res) => {
        this.results = res.data;
      });
  },
  methods: {
    isRouteActive(path) {
      if (this.$route.path.includes(path)) {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>
