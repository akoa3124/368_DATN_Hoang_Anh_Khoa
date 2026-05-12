# Checklist Lần 2 - Phongtro123

## 1. Những phần đã có trong repo
- Frontend React/Vite với giao diện tìm kiếm, trang chi tiết, trang quản lý người dùng.
- Backend NodeJS/Express với API REST, xác thực JWT và Google OAuth.
- Chức năng đăng bài, xem bài, xóa bài, duyệt bài, từ chối bài.
- Tìm kiếm và lọc bài đăng theo `category`, `priceRange`, `areaRange`, `typeNews`.
- Hệ thống favourite cho người dùng.
- Chat/messenger realtime bằng Socket.io.
- Trang AI Search và endpoint `/ai-search` để gọi LLM.
- Tích hợp tính năng nạp tiền / recharge user.
- Middleware xử lý lỗi chung (error handler).
- Cấu trúc dữ liệu bài đăng đã mở rộng với `tags`, `summary`, `features`.
- AI auto-tag và auto-summary được gọi ở luồng tạo bài đăng.
- Recommendation service đã tồn tại trong `server/src/services/recommendation.service.js`.

## 2. Các phần đã bổ sung / đang phát triển
- Recommendation hiện sử dụng hybrid logic: content-based + collaborative filtering dựa trên favourite history.
- `AiGenerateTagsAndSummary` đã thêm metadata (tags, summary) cho bài mới.
- `features` bucket hóa giá, diện tích, vị trí, category, optionFlags đã được tạo và lưu vào schema.
- `controllerPosts.createPost` đã được mở rộng để lưu tags/summary/features.
- `postSuggest` endpoint đã được kết nối với `recommendationService.getHybridRecommendations()`.

## 3. Những phần đề cập trong đề cương nhưng repo đang dùng khác
- Đề cương gợi ý backend FastAPI/Python, nhưng repo hiện dùng NodeJS/Express.
- Đề cương gợi ý PostgreSQL, nhưng repo hiện dùng MongoDB/Mongoose.
- LLM vẫn được sử dụng đúng hướng, repo tích hợp với Google Gemini (`@google/generative-ai`).
- Thiết kế admin dashboard và quản lý bài đăng đã có, nhưng chưa có export báo cáo Excel/PDF.
- Quy trình phê duyệt tin đăng hiện có, nhưng phân chia vai trò Sinh viên/Chủ nhà còn chung chung.
- Đo lường độ chính xác AI với metric (Precision / Recall / F1).

## 4. Những phần còn thiếu
- Triển khai PostgreSQL hoặc chuẩn bị migration, dù hiện repo dùng MongoDB.
- Hệ thống đánh giá / review phòng trọ.
- Tính năng tìm người ở ghép chuyên biệt.
- Phân định vai trò Sinh viên / Chủ nhà rõ ràng hơn ngoài admin/user.
- Hoàn thiện recommendation engine thành mô hình gợi ý đủ độ chính xác.

## 5. Kết luận nhanh
- Repo đã có nhiều nền tảng quan trọng: frontend, backend, auth, post CRUD, AI metadata, recommendation sơ bộ.
- Quan trọng nhất cần hoàn thiện: recommendation thực sự theo đề cương, review/rating, export báo cáo, role-based access, Docker/PostgreSQL, và các phần đánh giá AI.
