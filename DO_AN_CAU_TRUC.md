# Đề cương đồ án tốt nghiệp: Phongtro123

## 1. Giới thiệu

### 1.1 Tên đề tài
- Phát triển hệ thống quản lý và tìm kiếm phòng trọ thông minh cho sinh viên

### 1.2 Lý do chọn đề tài
- Thị trường cho thuê phòng trọ hiện nay có nhiều rủi ro về thông tin không chính xác, quảng cáo sai lệch và khó khăn trong tìm kiếm.
- Sinh viên cần một nền tảng dễ sử dụng, có lọc thông minh và hỗ trợ lập trình tìm kiếm phù hợp.

### 1.3 Mục tiêu của đề tài
- Xây dựng hệ thống web full-stack phục vụ đăng tin và tìm kiếm phòng trọ.
- Tích hợp hệ thống gợi ý và tìm kiếm thông minh bằng AI.
- Hỗ trợ cơ chế đăng nhập, đăng ký, phân quyền, quản lý bài đăng và thanh toán.

## 2. Phạm vi nghiên cứu
- Ứng dụng cho người dùng là sinh viên và chủ cho thuê phòng.
- Tập trung vào chức năng đăng tin, tìm kiếm, yêu thích, chat realtime, và thanh toán nạp tiền.
- Không bao gồm: quản lý bất động sản quy mô doanh nghiệp, tìm kiếm nâng cao với bản đồ phức tạp.

## 3. Công nghệ sử dụng

### 3.1 Frontend
- React
- Vite
- Ant Design
- React Router
- Socket.io Client
- Axios
- Sass / CSS module

### 3.2 Backend
- Node.js
- Express
- MongoDB + Mongoose
- JWT
- Google OAuth
- Socket.io
- Multer
- Nodemailer
- Axios

### 3.3 AI và tìm kiếm thông minh
- Google Generative AI (Gemini)
- AI Search gợi ý và tìm kiếm theo ngôn ngữ tự nhiên
- AI tự động sinh tag và summary cho bài đăng

### 3.4 Thanh toán
- VNPAY
- MoMo

## 4. Kiến trúc hệ thống

### 4.1 Tổng quan hệ thống
- Frontend: `client/`
- Backend: `server/`
- Cơ sở dữ liệu: MongoDB
- Giao tiếp REST API giữa frontend và backend
- Chat realtime bằng Socket.io
- Upload ảnh lưu trữ tạm thời trên server

### 4.2 Cấu trúc thư mục chính

#### `client/`
- `src/App.jsx`: cấu trúc giao diện chính
- `src/main.jsx`: entry point frontend
- `src/routes/index.jsx`: định nghĩa route frontend
- `src/Components/`: các component tái sử dụng
- `src/Pages/`: các trang chức năng
- `src/config/request.jsx`: cấu hình request API
- `src/hooks/`: hooks tùy chỉnh

#### `server/`
- `src/server.js`: entry point backend
- `src/config/ConnectDB.js`: kết nối MongoDB
- `src/routes/`: định nghĩa các route API
- `src/controllers/`: logic xử lý API
- `src/models/`: schema Mongoose
- `src/services/`: logic nghiệp vụ, recommendation, socket, token
- `src/utils/`: AI Search, chatbot, gửi mail
- `src/uploads/images`: lưu tệp ảnh upload

### 4.3 Sơ đồ luồng chính
1. Người dùng truy cập giao diện React
2. Gửi yêu cầu API đến backend qua Axios
3. Backend xác thực JWT / Google OAuth
4. Backend xử lý logic với controller và model
5. Dữ liệu lưu trữ trong MongoDB
6. Chat realtime qua Socket.io
7. AI Gemini hỗ trợ tìm kiếm và tạo metadata

## 5. Mô tả các module chính

### 5.1 Frontend
- `HomePage`: trang chủ hiển thị bài đăng nổi bật và tìm kiếm
- `DetailPost`: trang chi tiết bài đăng phòng trọ
- `LoginUser` / `RegisterUser`: đăng nhập, đăng ký
- `InfoUser`: trang cá nhân người dùng
- `Admin`: dashboard quản trị
- `AISearch`: trang tìm kiếm AI theo câu hỏi
- `Header`, `Layout`, `CardBody`: component giao diện chung

### 5.2 Backend
- Route chính: `users.routes.js`, `posts.routes.js`, `payments.routes.js`, `messenger.routes.js`, `favourite.routes.js`, `review.routes.js`
- Upload ảnh: `POST /api/upload-images`, `POST /api/upload-image`
- Controller posts: tạo tin, lấy tin, lọc theo giá/diện tích/loại tin, chi tiết tin, duyệt, từ chối
- Controller users: xác thực, thông tin người dùng, Google OAuth, reset mật khẩu
- Payment: xử lý nạp tiền qua MoMo/VNPAY
- Messenger: chat realtime và lưu trữ tin nhắn

### 5.3 Recommendation & AI
- `server/src/services/recommendation.service.js`
  - Content-based scoring: category, location, price bucket, area bucket, option, tags
  - Collaborative filtering: dựa trên bài đăng yêu thích của người dùng
  - Bonus: tin VIP và độ mới
- `server/src/utils/AISearch/AISearch.js`
  - `AiSearchKeyword`: gợi ý tìm kiếm từ câu hỏi người dùng
  - `AiSearch`: tìm bài đăng phù hợp dựa trên nội dung bài viết
  - `AiGenerateTagsAndSummary`: tự động tạo tag và tóm tắt cho bài đăng

### 5.4 Authentication
- JWT xác thực token
- Google OAuth tích hợp
- Middleware kiểm tra quyền truy cập

### 5.5 Chat realtime
- Sử dụng Socket.io để kết nối hai chiều giữa người dùng và chủ nhà
- Lưu trữ trạng thái kết nối và tin nhắn
- Hiển thị trạng thái online/offline

### 5.6 Upload ảnh
- Multer cấu hình lưu ảnh vào `src/uploads/images`
- Trả về URL ảnh dưới dạng `http://localhost:3000/uploads/images/<filename>`

## 6. Thiết kế database

### 6.1 Các model chính
- `users.model.js`: thông tin người dùng, mật khẩu, token, role, balance
- `post.model.js`: bài đăng phòng trọ, trạng thái, tags, summary, features
- `favourite.model.js`: bài đăng yêu thích của người dùng
- `review.model.js`: đánh giá, bình luận
- `messager.model.js`: tin nhắn chat
- `RechargeUser.model.js`: lịch sử nạp tiền
- `otp.model.js`: mã OTP reset mật khẩu

### 6.2 Mối quan hệ dữ liệu
- Một người dùng có thể có nhiều bài đăng
- Một người dùng có thể yêu thích nhiều bài đăng
- Bài đăng thuộc về người dùng và có trạng thái active/inactive
- Bài đăng có metadata tags và summary để tăng chất lượng tìm kiếm

## 7. Hướng dẫn cài đặt và chạy

### 7.1 Backend
```bash
cd server
npm install
npm run dev
```

### 7.2 Frontend
```bash
cd client
npm install
npm run dev
```

### 7.3 Biến môi trường cần cấu hình
- `CONNECT_DB`
- `CLIENT_URL`
- `SECRET_CRYPTO`
- `JWT_SECRET`
- `EMAIL_USER`
- `CLIENT_ID`, `CLIENT_SECRET`, `REDIRECT_URI`, `REFRESH_TOKEN`
- `GOOGLE_API_KEY`

## 8. Nội dung báo cáo đồ án

### 8.1 Mở đầu
- Giới thiệu vấn đề
- Lý do chọn đề tài
- Mục tiêu đề tài
- Phạm vi nghiên cứu

### 8.2 Cơ sở lý thuyết
- Giới thiệu công nghệ React, Node.js, Express, MongoDB
- Giải thích JWT, Google OAuth
- Mô tả khái niệm Recommendation System
- Giới thiệu AI generative (Gemini) trong tìm kiếm
- Tổng quan về thanh toán điện tử VNPAY và MoMo

### 8.3 Phân tích yêu cầu
- Yêu cầu chức năng
- Yêu cầu phi chức năng
- Phân tích đối tượng người dùng
- Use case chính: tìm phòng, đăng tin, chat, thanh toán

### 8.4 Thiết kế hệ thống
- Kiến trúc 3 tầng
- Sơ đồ luồng dữ liệu
- Thiết kế database
- Thiết kế API
- Thiết kế giao diện

### 8.5 Cài đặt và triển khai
- Mô tả chi tiết frontend
- Mô tả chi tiết backend
- Thực hiện các chức năng chính
- Hướng dẫn cài đặt, cấu hình và chạy hệ thống

### 8.6 Kiểm thử
- Các trường hợp kiểm thử chức năng
- Kiểm thử đăng nhập/đăng ký
- Kiểm thử tìm kiếm, lọc tin
- Kiểm thử chat và thanh toán
- Kết quả kiểm thử

### 8.7 Kết luận và đề xuất
- Tổng kết kết quả đạt được
- Ưu điểm và hạn chế
- Hướng phát triển tiếp theo

## 9. Nội dung đề xuất mở rộng
- Thêm tính năng lịch xem phòng và đặt lịch gặp chủ nhà
- Hệ thống review rating chuyên sâu
- Bổ sung bản đồ và tìm kiếm theo vị trí GPS
- Thêm thông báo real-time và email/SMS
- Triển khai Docker và cloud
- Cải thiện Recommendation bằng machine learning chuyên sâu

## 10. Tài liệu tham khảo
- Tài liệu Google Gemini
- Tài liệu MongoDB và Mongoose
- Tài liệu Express và React
- Tài liệu VNPAY/MoMo
- Tài liệu Socket.io

## 11. Phụ lục
### 11.1 Cấu trúc thư mục
- `client/`
  - `src/Components/`
  - `src/Pages/`
  - `src/routes/index.jsx`
  - `src/config/request.jsx`
- `server/`
  - `src/routes/`
  - `src/controllers/`
  - `src/models/`
  - `src/services/`
  - `src/utils/`
  - `src/uploads/images`

### 11.2 Các API chính
- `POST /api/login`
- `POST /api/register`
- `GET /api/posts`
- `GET /api/post?id=`
- `POST /api/create-post`
- `POST /api/upload-images`
- `POST /api/upload-image`
- `POST /chat`
- `GET /ai-search`
- `POST /api/payments` (hoặc route tương ứng)

### 11.3 Mô tả một số file quan trọng
- `server/src/services/recommendation.service.js`: engine gợi ý hybrid
- `server/src/utils/AISearch/AISearch.js`: tích hợp Gemini
- `server/src/controllers/posts.controller.js`: xử lý tạo, lọc, lấy chi tiết bài đăng
- `client/src/routes/index.jsx`: định nghĩa tuyến đường frontend
- `client/src/config/request.jsx`: cấu hình gọi API

---

> File này là khuôn mẫu cấu trúc đồ án dựa trên codebase hiện có. Bạn có thể bổ sung chi tiết cụ thể vào từng mục bằng cách tham chiếu trực tiếp vào các file và chức năng trong repo.`