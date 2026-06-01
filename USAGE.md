# Hướng dẫn sử dụng dự án `phongtro123`

## Tổng quan

Dự án `phongtro123` là hệ thống web quản lý và tìm kiếm phòng trọ, bao gồm:
- `client/`: Frontend React + Vite
- `server/`: Backend Node.js + Express

Frontend hiển thị giao diện tìm phòng, đăng tin, đăng nhập/đăng ký, thanh toán và quản lý người dùng.
Backend cung cấp API RESTful, xác thực JWT, xử lý thanh toán, chat realtime với Socket.io và tích hợp AI/Gemini.

## Yêu cầu môi trường

- Node.js 18+ (hoặc phiên bản tương thích)
- npm
- MongoDB (cài đặt và chạy)

## Cài đặt

### 1. Backend

```bash
cd server
npm install
```

### 2. Frontend

```bash
cd client
npm install
```

## Biến môi trường

Backend sử dụng file `.env` trong thư mục `server/`.
Dưới đây là các biến môi trường quan trọng:

```env
CONNECT_DB="mongodb://localhost:27017/phongtro"
CLIENT_URL='http://localhost:5173'
SECRET_CRYPTO="123456"
JWT_SECRET="123456"
EMAIL_USER="<email gửi mail>"
CLIENT_ID="<Google OAuth client id>"
CLIENT_SECRET="<Google OAuth client secret>"
REDIRECT_URI='https://developers.google.com/oauthplayground'
REFRESH_TOKEN="<Google OAuth refresh token>"
GOOGLE_API_KEY="<Google Gemini API key>"
```

> Lưu ý: `server/.env` trong kho mã hiện có giá trị mẫu. Thay thế bằng thông tin thực tế khi triển khai.

## Chạy ứng dụng

### 1. Khởi động backend

```bash
cd server
npm run dev
```

Backend chạy mặc định trên `http://localhost:3000`.

### 2. Khởi động frontend

```bash
cd client
npm run dev
```

Frontend chạy mặc định trên `http://localhost:5173`.

## Các tính năng chính

### Frontend
- Giao diện tìm phòng, trang chi tiết bài đăng
- Đăng nhập/đăng ký
- Đăng tin, chỉnh sửa tin
- Quản lý người dùng và admin
- Upload ảnh với endpoint `/api/upload-images` và `/api/upload-image`
- Kết nối chat realtime qua Socket.io

### Backend
- API RESTful cho người dùng, bài đăng, favourite, review, thanh toán
- Xác thực JWT
- Xác thực Google OAuth
- Chat realtime qua Socket.io
- Tích hợp AI Search và chatbot với Google Gemini
- Thanh toán với VNPAY và MoMo
- Upload ảnh lên `server/src/uploads/images`

## API chính

Backend cấu hình các route chính sau đây (đăng ký trong `server/src/routes/index.js`):
- `users.routes.js`
- `posts.routes.js`
- `payments.routes.js`
- `messenger.routes.js`
- `favourite.routes.js`
- `review.routes.js`

Ngoài ra còn có:
- `POST /api/upload-images` để upload nhiều ảnh
- `POST /api/upload-image` để upload một ảnh
- `POST /chat` truy vấn chatbot AI
- `GET /ai-search` tìm kiếm AI

## Cấu trúc quan trọng

### `server/`
- `src/server.js`: entry point backend
- `src/config/ConnectDB.js`: kết nối MongoDB
- `src/routes/`: định nghĩa route API
- `src/controllers/`: logic xử lý API
- `src/models/`: schema dữ liệu với Mongoose
- `src/services/`: logic nghiệp vụ (recommendation, token, socket)
- `src/utils/AISearch/`: tích hợp AI Search
- `src/utils/Chatbot/`: tích hợp chatbot
- `src/utils/SendMail/`: gửi email thông báo

### `client/`
- `src/main.jsx`: entry point React
- `src/App.jsx`: cấu trúc giao diện chính
- `src/routes/index.jsx`: định nghĩa route frontend
- `src/pages/`: các trang chính của ứng dụng
- `src/components/`: các component UI tái sử dụng
- `src/config/request.jsx`: cấu hình request API

## Lưu ý khi chạy

- Cần đảm bảo MongoDB đang chạy và `CONNECT_DB` trỏ đúng URL.
- Nếu cần dùng Google OAuth, cấu hình `CLIENT_ID`, `CLIENT_SECRET`, `REDIRECT_URI`, `REFRESH_TOKEN`.
- Nếu dùng tính năng AI, cần `GOOGLE_API_KEY` hợp lệ.
- File upload lưu ảnh trong `server/src/uploads/images` và trả đường dẫn dạng `http://localhost:3000/uploads/images/<filename>`.

## Các lệnh thường dùng

### Backend
- `npm run dev`: khởi động backend với nodemon

### Frontend
- `npm run dev`: khởi động frontend
- `npm run build`: build frontend
- `npm run preview`: xem trước phiên bản production
- `npm run lint`: kiểm tra ESLint

## Triển khai

1. Cập nhật `.env` ở `server/` với giá trị thực tế.
2. Khởi động MongoDB.
3. Chạy backend và frontend như hướng dẫn.
4. Nếu deploy production, cần điều chỉnh `CLIENT_URL` và route trả frontend phù hợp.

## Gợi ý mở rộng

- Thêm `Dockerfile` và `docker-compose.yml` để container hóa frontend/backend/MongoDB.
- Hoàn thiện `role` và phân quyền admin/user.
- Kiểm tra kỹ các route thanh toán và callback MoMo/VNPAY.
- Bổ sung kiểm thử (test) cho API và UI.

---

**Tác giả:** Dự án `phongtro123` được phát triển bằng React + Node.js + MongoDB và tích hợp AI Google Gemini.
