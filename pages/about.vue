<template>
  <div class="min-h-screen bg-gray-100">
    <div class="min-h-screen flex justify-center">
      <div class="w-full mx-auto">
        <div v-for="(item, index) in items" :key="index" class="flex flex-row w-full">
          <div :class="item.leftColClass" class="px-2 py-10">
            <div v-if="item.leftContent" class="flex flex-col w-full rounded-lg shadow bg-white px-4 py-5">
              <div class="text-gray-600 mb-2 flex justify-between">
                <div class="font-bold">{{ item.author }}</div>
                <div v-if="item.showButtons" class="flex flex-row">
                  <button class="text-blue-500 mr-2 hover:text-blue-300 transition duration-200">
                    <i class="far fa-edit"></i>
                  </button>
                  <button class="text-red-500 hover:text-red-300 transition duration-200">
                    <i class="far fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              <div class="text-gray-600" v-html="item.leftContent"></div>
            </div>
          </div>
          <div class="w-1/5 flex justify-center">
            <div class="relative flex h-full w-1 bg-green-300 items-center justify-center">
              <div class="absolute flex flex-col justify-center h-24 w-24 rounded-full border-2 border-green-300 leading-none text-center z-10 bg-white font-thin">
                <div :data-tip="item.date" class="tooltip">
                  {{ $moment(item.date, "YYYY-MM-DD").fromNow() }}
                </div>
              </div>
            </div>
          </div>
          <div :class="item.rightColClass" class="px-2 py-10">
            <div v-if="item.rightContent" class="flex flex-col w-full rounded-lg shadow bg-white px-4 py-5">
              <div class="text-gray-600 mb-2 flex justify-between">
                <div class="font-bold">{{ item.author }}</div>
              </div>
              <div class="text-gray-600" v-html="item.rightContent"></div>
            </div>
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
      title: this.$t("navmenu.about"),
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
  data() {
    return {
      items: [
        {
          leftColClass: "w-2/5",
          rightColClass: "w-2/5",
          date: "2021-10-25",
          author: "David Nguyen",
          leftContent: "",
          rightContent: `Thay đổi giao diện mới, bộ nhận diện thương hiệu, vẫn duy trì phiên bản cũ tại địa chỉ
            <a class="font-medium" target="_blank" rel="external nofollow noopener" href="https://old-radio.eplus.dev">https://old-radio.eplus.dev</a>.`,
          showButtons: false,
        },
        {
          leftColClass: "w-2/5",
          rightColClass: "w-2/5",
          date: "2021-07-04",
          author: "David Nguyen",
          leftContent: `Thêm đa ngôn ngữ <kbd class="kbd">Tiếng Anh/Tiếng Việt</kbd>, tổng cộng thời điểm này có 84 kênh thuộc
            <b>Việt Nam, Singapore, United Kingdom, Australia</b>.`,
          rightContent: "",
          showButtons: true,
        },
        {
          leftColClass: "w-2/5",
          rightColClass: "w-2/5",
          date: "2020-02-17",
          author: "David Nguyen",
          leftContent: "",
          rightContent: `<p>* Thêm radio mới thuộc quốc gia <kbd class="kbd">Vương quốc Anh</kbd> kênh: <b>Heart UK</b>.</p>
            <p>* Thêm radio mới thuộc quốc gia <kbd class="kbd">Singapore</kbd> các kênh: <b>Love 972, class 95, 987FM</b>.</p>`,
          showButtons: false,
        },
        {
          leftColClass: "w-2/5",
          rightColClass: "w-2/5",
          date: "2020-02-10",
          author: "David Nguyen",
          leftContent: `Thêm radio mới thuộc quốc gia <kbd class="kbd">Châu Úc</kbd> các kênh: <b>metro, abc-newsradio</b>.`,
          rightContent: "",
          showButtons: true,
        },
        {
          leftColClass: "w-2/5",
          rightColClass: "w-2/5",
          date: "2019-10-22",
          author: "David Nguyen",
          leftContent: "",
          rightContent: `Ra mắt trang web nghe radio online đầu tiên với 8 kênh:
            <b>VOV1, VOV2, VOV3, VOV4, VOV5, VOV English, VOV giao thông TP.HCM và VOV giao thông Hà Nội</b>.`,
          showButtons: false,
        },
        {
          leftColClass: "w-2/5",
          rightColClass: "w-2/5",
          date: "2019-10-19",
          author: "David Nguyen",
          leftContent: `Sở thích nghe đài bắt đầu từ những ngày thuở nhỏ, tôi sinh ra giữ những nền khoa học mới bắt đầu phát triển. Thuở nhỏ chỉ có
            chiếc đài radio, về sau khi các phương tiên thông tin phát triển như tivi thì chiếc đài dần biết mất. Khoảng những năm 2010, bắt đầu có
            những anten chảo, có chức năng nghe đài, tình cờ nghe được những đài ngày đó như là <b>ZoneFM</b>. Một thời gian sau khi học tập tại TP.HCM,
            k còn tiếp cận những chiếc tivi, cũng không nghe radio được nữa, tình cờ nghe được những chương trình <b>365 ngày hạnh phúc</b>, tôi tìm lại
            những kênh có thể nghe trực tiếp. Tôi bắt đầu tìm hiểu lập ra 1 website để nghe, với mục đích ban đầu là phục vụ nhu cầu cá nhân. Tôi bắt đầu
            thực hiện ý tưởng, bắt đầu những dòng code đầu tiên.`,
          rightContent: "",
          showButtons: true,
        },
      ],
    };
  }
};
</script>
