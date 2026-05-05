# Project Gap Checklist

## 1. Những phần đã có trong hệ thống hiện tại
- [x] Frontend React/Vite với giao diện tìm kiếm, trang chi tiết, trang quản lý người dùng.
- [x] Backend NodeJS/Express với API REST, xác thực người dùng và phân quyền admin.
- [x] Đăng bài, xem bài, xóa bài, duyệt bài và từ chối bài đều đã có.
- [x] Tìm kiếm và lọc bài đăng theo `category`, `priceRange`, `areaRange`, `typeNews`.
- [x] Hỗ trợ đăng nhập Google OAuth và xác thực JWT.
- [x] Hệ thống yêu thích (favourite) cho người dùng.
- [x] Chat/messenger realtime với socket.io.
- [x] Page AI Search và endpoint `/ai-search` để gọi LLM.
- [x] Map embed cho chi tiết bài đăng và form thêm bài đăng.
- [x] Admin dashboard và trang quản lý bài đăng.
- [x] Chức năng nạp tiền / recharge user.
- [x] Middleware xử lý lỗi chung (error handler).

## 2. Các phần hiện có nhưng cần hoàn thiện rõ ràng
- [ ] Mục "Phòng trọ dành riêng cho bạn" hiện tại chỉ là gợi ý theo địa chỉ (address-based), chưa là Hybrid Recommendation System.
- [ ] Hệ thống chưa có gắn thẻ (tagging) bài đăng tự động từ nội dung.
- [ ] Chưa có tóm tắt nội dung bài đăng bằng AI.
- [ ] Chưa có bộ lọc khoảng cách đến trường hoặc tìm kiếm dựa trên bản đồ tương tác.
- [ ] Chưa có hệ thống đánh giá / review phòng trọ.
- [ ] Chưa có xuất báo cáo Excel/PDF cho Admin.
- [ ] Chưa có phân định rõ vai trò `Sinh viên` / `Chủ nhà` ngoài `admin` và `user` chung.
- [ ] Chưa có quy trình xử lý dữ liệu Ingest → Clean → Store rõ ràng.

## 3. Những mục tiêu đề cương còn thiếu trong code hiện tại
- [ ] Docker/Docker Compose để container hóa ứng dụng.
- [ ] Triển khai PostgreSQL như đề cương; repo hiện dùng MongoDB/Mongoose.
- [ ] Mô hình Hybrid Recommendation System thực sự (kết hợp Content-based + Collaborative Filtering).
- [ ] LLM thật sự dùng để auto-tag và auto-summary bài đăng.
- [ ] Đo lường độ chính xác AI với metric như Precision / Recall / F1.
- [ ] Tập dữ liệu, chia Train/Val/Test và phân tích lỗi mô hình.
- [ ] Logging chuyên sâu (persistent logs, file logs hoặc hệ thống logging).
- [ ] Sơ đồ quy trình nghiệp vụ (BPMN / Use Case) trong repo.
- [ ] Phân tích dữ liệu / pipeline dữ liệu cho mô hình recommend.
- [ ] Tính năng tìm người ở ghép cụ thể.
- [ ] Tính năng quản lý vi phạm / báo cáo vi phạm cho Admin.

## 4. Đề xuất ưu tiên bổ sung
1. Hoàn thiện hệ thống recommend: `post-suggest` hiện tại chỉ gợi ý theo quận/huyện.
2. Thêm AI tagging + summary cho post khi tạo/duyệt bài.
3. Bổ sung review/rating và tính năng đặt lịch xem phòng.
4. Thêm export dashboard/Excel/PDF cho admin.
5. Triển khai Docker và nếu cần, chuyển qua PostgreSQL theo đề cương.

## 5. File nên kiểm tra thêm
- `server/src/controllers/posts.controller.js`
- `server/src/routes/posts.routes.js`
- `server/src/utils/AISearch/AISearch.js`
- `client/src/Pages/AISearch/AISearch.jsx`
- `client/src/Pages/DetailPost/DetailPost.jsx`
- `client/src/Pages/Admin/Components/ManagerPost/ManagerPost.jsx`
- `client/src/Pages/Admin/Components/Dashborad/Dashborad.jsx`
- `client/src/Pages/InfoUser/Components/ManagerPost/AddPostForm.jsx`

---

> Kết luận: dự án đã có nền tảng tốt, nhưng vẫn cần bổ sung rõ ràng phần recommendation AI chính xác, tagging/summarization tự động, review, export báo cáo và container hoá.
