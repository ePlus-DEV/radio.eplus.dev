<template>
  <div class="overflow-x-auto w-full mb-4">
    <table class="table w-full">
      <thead>
        <tr>
          <th class="dark:bg-gray-500 dark:text-gray-200">
            {{ $t("table.status") }}
          </th>
          <th class="dark:bg-gray-500 dark:text-gray-200">
            {{ $t("table.commit") }}
          </th>
          <th class="dark:bg-gray-500 dark:text-gray-200">
            {{ $t("table.created") }}
          </th>
          <th class="dark:bg-gray-500 dark:text-gray-200">
            {{ $t("table.updated") }}
          </th>
          <th class="dark:bg-gray-500 dark:text-gray-200">
            {{ $t("table.published") }}
          </th>
          <th class="dark:bg-gray-500 dark:text-gray-200"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data" :key="index">
          <th class="flex justify-center dark:bg-gray-700 dark:text-gray-200">
            <label>
              <div
                v-if="item.state === 'ready'"
                :data-tip="item.state"
                class="tooltip"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="rgba(4, 120, 87, var(--tw-bg-opacity))"
                  class="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div
                v-else-if="item.state === 'processing'"
                :data-tip="item.state"
                class="tooltip"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                  />
                </svg>
              </div>
              <div
                v-else-if="item.state === 'uploading'"
                :data-tip="item.state"
                class="tooltip"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </div>
              <div
                v-else-if="item.state === 'building'"
                :data-tip="item.state"
                class="tooltip"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <div
                v-else-if="item.state === 'enqueued'"
                :data-tip="item.state"
                class="tooltip"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                  />
                </svg>
              </div>
              <div v-else :data-tip="item.state" class="tooltip">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="rgba(220, 38, 38, var(--tw-bg-opacity))"
                  class="w-6 h-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
            </label>
          </th>
          <td class="dark:bg-gray-700 dark:text-gray-200">
            <a
              :href="item.commit_url"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ item.state === "error" ? item.error_message : item.title }}
            </a>
          </td>
          <td class="dark:bg-gray-700 dark:text-gray-200">
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
          <td class="dark:bg-gray-700 dark:text-gray-200">
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
          <th class="dark:bg-gray-700 dark:text-gray-200">
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
          </th>
          <th class="dark:bg-gray-700 dark:text-gray-200">
            <a
              target="_blank"
              rel="external nofollow noopener"
              :href="item.links.permalink"
              class="text-blue-600 dark:text-blue-200 hover:underline"
            >
              {{ $t("table.view") }}
            </a>
          </th>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th class="dark:bg-gray-500 dark:text-gray-200">
            {{ $t("table.status") }}
          </th>
          <th class="dark:bg-gray-500 dark:text-gray-200">
            {{ $t("table.commit") }}
          </th>
          <th class="dark:bg-gray-500 dark:text-gray-200">
            {{ $t("table.created") }}
          </th>
          <th class="dark:bg-gray-500 dark:text-gray-200">
            {{ $t("table.updated") }}
          </th>
          <th class="dark:bg-gray-500 dark:text-gray-200">
            {{ $t("table.published") }}
          </th>
          <th class="dark:bg-gray-500 dark:text-gray-200"></th>
        </tr>
      </tfoot>
    </table>
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
      polling: null,
    };
  },
  beforeDestroy() {
    window.clearTimeout(this.polling);
  },
  methods: {
    async fetchData() {
      var self = this;
      var config = {
        method: "get",
        url:
          process.env.NETLIFY_BASE_URL +
          process.env.NETLIFY_SITE_ID +
          "/deploys?page=1&per_page=20",
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

      // Loop
      window.clearTimeout(self.polling);
      self.polling = setTimeout(function () {
        self.fetchData();
      }, 30000);
    },
  },
  created() {
    Promise.all([this.fetchData()]).then(() => {});
  },
};
</script>
