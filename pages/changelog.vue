<template>
  <div>
    <div class="flex flex-col">
      <div class="overflow-x-auto shadow-md sm:rounded-lg mb-4">
        <div class="inline-block min-w-full align-middle">
          <div class="overflow-hidden">
            <table
              class="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-700"
            >
              <thead class="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th scope="col" class="p-4">
                    <div class="flex items-center">
                      <input
                        id="checkbox-all"
                        type="checkbox"
                        class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label for="checkbox-all" class="sr-only">checkbox</label>
                    </div>
                  </th>
                  <th
                    scope="col"
                    class="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400"
                  >
                    {{ $t("table.commit") }}
                  </th>
                  <th
                    scope="col"
                    class="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400"
                  >
                    {{ $t("table.created") }}
                  </th>
                  <th
                    scope="col"
                    class="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400"
                  >
                    {{ $t("table.updated") }}
                  </th>
                  <th
                    scope="col"
                    class="py-3 px-6 text-xs font-medium tracking-wider text-left text-gray-700 uppercase dark:text-gray-400"
                  >
                    {{ $t("table.published") }}
                  </th>
                  <th scope="col" class="p-4">
                    <span class="sr-only">URL</span>
                  </th>
                </tr>
              </thead>
              <tbody
                class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700"
              >
                <tr
                  class="hover:bg-gray-100 dark:hover:bg-gray-700"
                  v-for="(item, index) in data"
                  :key="index"
                >
                  <td class="p-4 w-4">
                    <div class="flex items-center">
                      <input
                        id="checkbox-table-1"
                        type="checkbox"
                        class="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label for="checkbox-table-1" class="sr-only">checkbox</label>
                    </div>
                  </td>
                  <td
                    class="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {{ item.title }}
                  </td>
                  <td
                    class="py-4 px-6 text-sm font-medium text-gray-500 whitespace-nowrap dark:text-white"
                  >
                    <div
                      :data-tip="
                        $moment(item.created_at)
                          .tz('Asia/Ho_Chi_Minh')
                          .format('YYYY-MM-DD HH:mm:ss')
                      "
                      class="tooltip"
                    >
                      {{ $moment(item.created_at).tz("Asia/Ho_Chi_Minh").fromNow() }}
                    </div>
                  </td>
                  <td
                    class="py-4 px-6 text-sm font-medium text-gray-500 whitespace-nowrap dark:text-white"
                  >
                    <div
                      :data-tip="
                        $moment(item.updated_at)
                          .tz('Asia/Ho_Chi_Minh')
                          .format('YYYY-MM-DD HH:mm:ss')
                      "
                      class="tooltip"
                    >
                      {{ $moment(item.updated_at).tz("Asia/Ho_Chi_Minh").fromNow() }}
                    </div>
                  </td>
                  <td
                    class="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <div
                      :data-tip="
                        $moment(item.published_at)
                          .tz('Asia/Ho_Chi_Minh')
                          .format('YYYY-MM-DD HH:mm:ss')
                      "
                      class="tooltip"
                    >
                      {{ $moment(item.published_at).tz("Asia/Ho_Chi_Minh").fromNow() }}
                    </div>
                  </td>

                  <td class="py-4 px-6 text-sm font-medium text-right whitespace-nowrap">
                    <a
                      target="_blank"
                      :href="item.links.permalink"
                      class="text-blue-600 dark:text-blue-500 hover:underline"
                      >
                      {{ $t("table.view") }}
                      </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: this.$t("navmenu.changelog"),
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Cập nhật những thay đổi từ hệ thống.",
        },
      ],
    };
  },
  data() {
    return {
      data: [],
    };
  },
  methods: {
    async fetchData() {
      var self = this;
      var config = {
        method: "get",
        url:
          process.env.NETLIFY_BASE_URL + process.env.NETLIFY_SITE_ID + "/deploys?page=1&per_page=20",
        headers: {
          Authorization: "Bearer " + process.env.NETLIFY_TOKEN,
        },
      };

      this.$axios(config)
        .then(function (response) {
          self.data = response.data;
        })
        .catch(function (error) {
          console.log(error);
        });
    },
  },
  created() {
    Promise.all([this.fetchData()]).then(() => {});
  },
};
</script>
