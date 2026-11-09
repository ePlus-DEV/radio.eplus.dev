# ePlus OnAir — toàn bộ danh mục radio và nguyên tắc phân loại

## Phạm vi (kiểm kê source, 2026-11-08)

- **4.217** bản ghi radio địa lý trong **90 file quốc gia / 7 vùng**; cộng **7 kênh Apple Music Global Radio** thành **4.224** bản ghi nguồn. Đây là số *bản ghi catalog*, không phải số đài trực tuyến đã được kiểm tra phát thành công hay số đài không trùng.
- Phân bổ theo vùng: châu Phi 470; châu Á 704; Trung Mỹ 253; châu Âu 1.968; Bắc Mỹ 298; châu Đại Dương 83; Nam Mỹ 441; Global Radio 7.
- Chỉ **115/4.217** kênh địa lý có trường `category`: Việt Nam 77, Anh 38. Một số giá trị là tên đài, tỉnh hoặc băng tần nên **không thể coi là thể loại phát thanh**.
- **0/4.217** kênh địa lý có trường `language`; Global Radio khai báo ngôn ngữ cho 7 kênh. Không tự suy ra tiếng phát thanh từ quốc gia.

## Phân loại độc lập, không sửa catalog gốc

| Chiều phân loại | Giá trị | Quy tắc |
|---|---|---|
| Địa lý | 7 vùng, quốc gia từ đường dẫn; Global Radio tách riêng | Lấy từ đường dẫn catalog, không suy đoán nơi đặt máy phát |
| Nội dung | music, news, talk, sports, traffic, culture, education, community, international, health, kids, religion, entertainment, unknown | Chỉ từ `category` có nghĩa rõ ràng, danh sách tag mô tả ngắn có trong catalog, hoặc ngoại lệ đã xem xét |
| Nhạc | pop, rock, jazz, classical, electronic, dance, trance, house, hiphop, metal, folk, country, latin, chill, acoustic, indie, oldies, soul, funk, blues, reggae, hits, ... | Chỉ nhận tag chính xác, có thể nhiều tag; không đoán từ tên đài |
| Ngôn ngữ | Giá trị khai báo; rỗng nếu chưa có | Không gán tự động theo quốc gia |
| Băng tần | fm, am, unknown | Chỉ khi `signal` khai báo rõ FM/AM; không đoán từ loại stream |
| Mức độ căn cứ | catalog-category, catalog-tags, provider-genre, reviewed-catalog, hoặc không có | Đây là **thông tin được khai báo / đã rà soát catalog**, không phải kiểm chứng live |

**Lưu ý:** `unknown` là *chưa đủ căn cứ*, không phải “đài tổng hợp”. Một đài có thể thuộc nhiều nhóm. Trường `category` gốc vẫn được giữ nguyên trong giao diện thông tin nguồn và SEO.

## Xuất danh sách cho toàn bộ radio

```bash
npm run catalog:classify
```

Hai file được sinh trong thư mục **reports/**:
- `radio-classification.csv`: mỗi hàng tương ứng một bản ghi radio, có đường dẫn, vùng/quốc gia, nhóm nội dung, dòng nhạc, ngôn ngữ, băng tần và căn cứ.
- `radio-classification-summary.json`: thống kê theo vùng/nhóm, đã xác định và chưa xác minh.

Script đọc trực tiếp toàn bộ JSON nguồn mỗi lần chạy, bao gồm cả bản ghi `active:false` hoặc `disabled:true` để không bỏ sót khi kiểm kê. Không có URL stream, token hay dữ liệu người dùng trong báo cáo. Báo cáo đặt ngoài `public/` để tránh làm tăng kích thước deploy GitHub Pages.

## Quy trình nâng chất lượng

1. Ưu tiên kiểm chứng các kênh có `unknown` bằng trang chính thức hoặc metadata do nhà phát thanh cung cấp, rồi bổ sung `category` / `language` **đúng nghĩa** vào catalog.
2. Không đổi `category` gốc chỉ vì giá trị giống tên đài; cập nhật từng nhóm có nguồn xác minh và test.
3. Sau khi bổ sung metadata, build lại search index sẽ tự cập nhật nhóm nội dung; không chỉnh stream, phát tự động, canonical, JSON-LD, sitemap hoặc GA4.
4. Có thể dùng `station_groups` và `station_genres` trong search index để bổ sung UI lọc, nhưng **không dùng genre chưa xác minh để lọc bỏ hoặc gán bừa radio**.

## Ghi chú kỹ thuật

- Logic: `utils/station-classification.mjs`
- Search index: `scripts/build-station-search-index.mjs`
- Audit/export: `scripts/audit-radio-classification.mjs`
- Kiểm thử: `tests/station-classification.test.mjs`
