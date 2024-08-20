<template>
  <div class="min-h-screen bg-gray-100">
    <div class="min-h-screen flex justify-center">
      <div class="w-full mx-auto">
        <!-- BEGIN - ITEM - RIGHT -->
        <div class="flex flex-row w-full">
          <!-- left col -->
          <div class="w-2/5 px-2 py-10"></div>
          <!--line column-->
          <div class="w-1/5 flex justify-center">
            <div
              class="relative flex h-full w-1 bg-green-300 items-center justify-center"
            >
              <div
                class="absolute flex flex-col justify-center h-24 w-24 rounded-full border-2 border-green-300 leading-none text-center z-10 bg-white font-thin"
              >
                <div data-tip="2021-10-25" class="tooltip">
                  {{ this.$moment("2021-10-25", "YYYY-MM-DD").fromNow() }}
                </div>
              </div>
            </div>
          </div>
          <!--right column-->
          <div class="w-2/5 px-2 py-10">
            <div
              class="flex flex-col w-full rounded-lg shadow bg-white px-4 py-5"
            >
              <div class="text-gray-600 mb-2 flex justify-between">
                <div class="font-bold">David Nguyen</div>
              </div>
              <div class="text-gray-600">
                Thay đổi giao diện mới, bộ nhận diện thương hiệu, vẫn duy trì
                phiên bản cũ tại địa chỉ
                <a
                  class="font-medium"
                  target="_blank"
                  rel="external nofollow noopener"
                  href="https://old-radio.eplus.dev"
                  >https://old-radio.eplus.dev</a
                >.
              </div>
            </div>
          </div>
        </div>
        <!-- END - ITEM - RIGHT -->
        <!-- BEGIN - ITEM - LEFT -->
        <div class="flex flex-row w-full">
          <!-- left col -->
          <div class="w-2/5 px-2 py-10">
            <div
              class="flex flex-col w-full rounded-lg shadow bg-white px-4 py-5"
            >
              <div class="text-gray-600 mb-2 flex justify-between">
                <div class="font-bold">David Nguyen</div>
                <div class="flex flex-row">
                  <button
                    class="text-blue-500 mr-2 hover:text-blue-300 transition duration-200"
                  >
                    <i class="far fa-edit"></i>
                  </button>
                  <button
                    class="text-red-500 hover:text-red-300 transition duration-200"
                  >
                    <i class="far fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              <div class="text-gray-600">
                Thêm đa ngôn ngữ <kbd class="kbd">Tiếng Anh/Tiếng Việt</kbd>,
                tổng cộng thời điểm này có 84 kênh thuộc
                <b>Việt Nam, Singapore, United Kingdom, Australia</b>.
              </div>
            </div>
          </div>
          <!--line column-->
          <div class="w-1/5 flex justify-center">
            <div
              class="relative flex h-full w-1 bg-green-300 items-center justify-center"
            >
              <div
                class="absolute flex flex-col justify-center h-24 w-24 rounded-full border-2 border-green-300 leading-none text-center z-10 bg-white font-thin"
              >
                <div data-tip="2021-07-04" class="tooltip">
                  {{ this.$moment("2021-07-04", "YYYY-MM-DD").fromNow() }}
                </div>
              </div>
            </div>
          </div>
          <!--right column-->
          <div class="w-2/5 px-2 py-10"></div>
        </div>
        <!-- END - ITEM - LEFT -->
        <!-- BEGIN - ITEM - RIGHT -->
        <div class="flex flex-row w-full">
          <!-- left col -->
          <div class="w-2/5 px-2 py-10"></div>
          <!--line column-->
          <div class="w-1/5 flex justify-center">
            <div
              class="relative flex h-full w-1 bg-green-300 items-center justify-center"
            >
              <div
                class="absolute flex flex-col justify-center h-24 w-24 rounded-full border-2 border-green-300 leading-none text-center z-10 bg-white font-thin"
              >
                <div data-tip="2020-02-17" class="tooltip">
                  {{ this.$moment("2020-02-17", "YYYY-MM-DD").fromNow() }}
                </div>
              </div>
            </div>
          </div>
          <!--right column-->
          <div class="w-2/5 px-2 py-10">
            <div
              class="flex flex-col w-full rounded-lg shadow bg-white px-4 py-5"
            >
              <div class="text-gray-600 mb-2 flex justify-between">
                <div class="font-bold">David Nguyen</div>
              </div>
              <div class="text-gray-600">
                <p>
                  * Thêm radio mới thuộc quốc gia
                  <kbd class="kbd">Vương quốc Anh</kbd> kênh: <b>Heart UK</b>.
                </p>
                <p>
                  * Thêm radio mới thuộc quốc gia
                  <kbd class="kbd">Singapore</kbd> các kênh:
                  <b>Love 972, class 95, 987FM</b>.
                </p>
              </div>
            </div>
          </div>
        </div>
        <!-- END - ITEM - RIGHT -->
        <!-- BEGIN - ITEM - LEFT -->
        <div class="flex flex-row w-full">
          <!-- left col -->
          <div class="w-2/5 px-2 py-10">
            <div
              class="flex flex-col w-full rounded-lg shadow bg-white px-4 py-5"
            >
              <div class="text-gray-600 mb-2 flex justify-between">
                <div class="font-bold">David Nguyen</div>
                <div class="flex flex-row">
                  <button
                    class="text-blue-500 mr-2 hover:text-blue-300 transition duration-200"
                  >
                    <i class="far fa-edit"></i>
                  </button>
                  <button
                    class="text-red-500 hover:text-red-300 transition duration-200"
                  >
                    <i class="far fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              <div class="text-gray-600">
                Thêm radio mới thuộc quốc gia <kbd class="kbd">Châu Úc</kbd> các
                kênh: <b>metro, abc-newsradio</b>.
              </div>
            </div>
          </div>
          <!--line column-->
          <div class="w-1/5 flex justify-center">
            <div
              class="relative flex h-full w-1 bg-green-300 items-center justify-center"
            >
              <div
                class="absolute flex flex-col justify-center h-24 w-24 rounded-full border-2 border-green-300 leading-none text-center z-10 bg-white font-thin"
              >
                <div data-tip="2020-02-10" class="tooltip">
                  {{ this.$moment("2020-02-10", "YYYY-MM-DD").fromNow() }}
                </div>
              </div>
            </div>
          </div>
          <!--right column-->
          <div class="w-2/5 px-2 py-10"></div>
        </div>
        <!-- END - ITEM - LEFT -->
        <!-- BEGIN - ITEM - RIGHT -->
        <div class="flex flex-row w-full">
          <!-- left col -->
          <div class="w-2/5 px-2 py-10"></div>
          <!--line column-->
          <div class="w-1/5 flex justify-center">
            <div
              class="relative flex h-full w-1 bg-green-300 items-center justify-center"
            >
              <div
                class="absolute flex flex-col justify-center h-24 w-24 rounded-full border-2 border-green-300 leading-none text-center z-10 bg-white font-thin"
              >
                <div data-tip="2019-10-22" class="tooltip">
                  {{ this.$moment("2019-10-22", "YYYY-MM-DD").fromNow() }}
                </div>
              </div>
            </div>
          </div>
          <!--right column-->
          <div class="w-2/5 px-2 py-10">
            <div
              class="flex flex-col w-full rounded-lg shadow bg-white px-4 py-5"
            >
              <div class="text-gray-600 mb-2 flex justify-between">
                <div class="font-bold">David Nguyen</div>
              </div>
              <div class="text-gray-600">
                Ra mắt trang web nghe radio online đầu tiên với 8 kênh:
                <b
                  >VOV1, VOV2, VOV3, VOV4, VOV5, VOV English, VOV giao thông
                  TP.HCM và VOV giao thông Hà Nội</b
                >.
              </div>
            </div>
          </div>
        </div>
        <!-- END - ITEM - RIGHT -->
        <!-- BEGIN - ITEM - LEFT -->
        <div class="flex flex-row w-full">
          <!-- left col -->
          <div class="w-2/5 px-2 py-10">
            <div
              class="flex flex-col w-full rounded-lg shadow bg-white px-4 py-5"
            >
              <div class="text-gray-600 mb-2 flex justify-between">
                <div class="font-bold">David Nguyen</div>
                <div class="flex flex-row">
                  <button
                    class="text-blue-500 mr-2 hover:text-blue-300 transition duration-200"
                  >
                    <i class="far fa-edit"></i>
                  </button>
                  <button
                    class="text-red-500 hover:text-red-300 transition duration-200"
                  >
                    <i class="far fa-trash-alt"></i>
                  </button>
                </div>
              </div>
              <div class="text-gray-600">
                Sở thích nghe đài bắt đầu từ những ngày thuở nhỏ, tôi sinh ra
                giữ những nền khoa học mới bắt đầu phát triển. Thuở nhỏ chỉ có
                chiếc đài radio, về sau khi các phương tiên thông tin phát triển
                như tivi thì chiếc đài dần biết mất. Khoảng những năm 2010, bắt
                đầu có những anten chảo, có chức năng nghe đài, tình cờ nghe
                được những đài ngày đó như là <b>ZoneFM</b>. Một thời gian sau
                khi học tập tại TP.HCM, k còn tiếp cận những chiếc tivi, cũng
                không nghe radio được nữa, tình cờ nghe được những chương trình
                <b>365 ngày hạnh phúc</b>, tôi tìm lại những kênh có thể nghe
                trực tiếp. Tôi bắt đầu tìm hiểu lập ra 1 website để nghe, với
                mục đích ban đầu là phục vụ nhu cầu cá nhân. Tôi bắt đầu thực
                hiện ý tưởng, bắt đầu những dòng code đầu tiên.
              </div>
            </div>
          </div>
          <!--line column-->
          <div class="w-1/5 flex justify-center">
            <div
              class="relative flex h-full w-1 bg-green-300 items-center justify-center"
            >
              <div
                class="absolute flex flex-col justify-center h-24 w-24 rounded-full border-2 border-green-300 leading-none text-center z-10 bg-white font-thin"
              >
                <div data-tip="2019-10-19" class="tooltip">
                  {{ this.$moment("2019-10-19", "YYYY-MM-DD").fromNow() }}
                </div>
              </div>
            </div>
          </div>
          <!--right column-->
          <div class="w-2/5 px-2 py-10"></div>
        </div>
        <!-- END - ITEM - LEFT -->
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
};
</script>
