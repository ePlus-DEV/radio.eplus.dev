export default async (context, locale) => {
  return await Promise.resolve({
    navmenu: {
      homepage: "Trang Chủ",
      about: "Giới Thiệu",
      blog: "Blog",
      group: "Nhóm",
      terms: "Điều Khoản",
      contact: "Liên Hệ",
      language: "Ngôn ngữ:",
      old_version: "#phienbancu",
      statistics: "Thống kê"
    },
    terms: {
      content:
        "Các kênh Radio đều dẫn nguồn từ các nhà đài trên khắp thế giới, chúng tôi không chịu trách nhiệm nội dung của các kênh Radio. Vui lòng cân nhắc trước khi dự định làm theo một điều gì đó. Website cam kết hoàn toàn miễn phí, không thu phí hoặc kiếm tiền bất cứ hình thức nào trên website."
    },
    contact: {
      content:
        "Chúng tôi luôn ghi nhận mọi đóng góp ý kiến hoặc đóng góp thêm link stream nhằm đa dạng hoá các kênh Radio trên website. Mọi đóng góp vui lòng liên hệ contact bên dưới. Cảm ơn các bạn."
    },
    world: {
      africa: {},
      asia: {
        name: "Châu Á",
        vietnam: "Việt Nam",
        singapore: "Singapore",
        korea: "Hàn Quốc",
        china: "Trung Quốc",
        hong_kong: "Hồng Kông",
        japan: "Nhật Bản",
        malaysia: "Ma-lai-xi-a",
        philippines: "Phi-líp-pin",
        indonesia: "In-đô-nê-xia",
        thailand: "Thái Lan"
      },
      central_america: {},
      europe: {
        name: "Châu Âu",
        united_kingdom: "Vương quốc Anh"
      },
      north_america: {
        name: "Bắc Mỹ",
        cuba: "Cuba"
      },
      oceania: {
        name: "Châu Đại Dương",
        australia: "Châu Úc",
        new_zealand: "New Zealand"
      },
      south_america: {}
    },
    panel: {
      most_popular: "Thịnh hành tại {name}",
      frequency: "Tần số",
      play_from_radio: "Phát từ Radio",
      country: "Quốc gia",
      radio_in: "Radio tại {name}",
      description: "Mô tả",
      category: "Thể Loại",
      schedule: "Lịch phát sóng",
      playlist: "Danh sách phát"
    },
    button: {
      back: "Quay lại",
      close: "Đóng"
    },
    popup: {
      search: {
        text: "Tìm kiếm...",
        stats:
          "Trang {page}/{nbPages} - {nbHits} kết quả trong {processingTimeMS} mili giây"
      }
    },
    notify: {
      success: "Thành công",
      success_content: "Có thể phát radio: {radio}",
      error: "Thất bại",
      error_content: "Không thể phát radio: {radio}"
    },
    statistics_tooltip: {
      text: "Sự cố: {num} | Ngừng hoạt động: {time} phút"
    },
    404: {
      content: "Chúng tôi muốn thông báo rằng trang bạn tìm, không tồn tại!"
    }
  });
};
