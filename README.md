# Phongtro123

## Tổng quan

**Phongtro123** là hệ thống web quản lý và tìm kiếm phòng trọ dành cho sinh viên và chủ nhà tại Việt Nam.
Mục tiêu chính của dự án là giảm thiểu rủi ro thông tin sai lệch, hỗ trợ tìm kiếm nhanh và cung cấp trải nghiệm tìm phòng thông minh.

Ứng dụng gồm hai phần chính:
- `client/`: Frontend React + Vite
- `server/`: Backend Node.js + Express + MongoDB

## Kiến trúc hệ thống

### Frontend
- React 18, Vite, Ant Design, Sass
- React Router cho điều hướng SPA
- Socket.io client cho chat realtime
- Hỗ trợ đăng nhập bằng email/password và Google OAuth
- Các module chính: Home, Đăng ký, Đăng nhập, Đăng tin, Chi tiết bài đăng, Quản lý người dùng, Dashboard admin

### Backend
- Express + Mongoose + MongoDB
- Xác thực JWT và Google OAuth
- API RESTful cho bài đăng, người dùng, favourite, review, recharge, report, violation
- Chat realtime với Socket.io
- Thanh toán bằng MoMo và VNPAY
- Tích hợp AI Gemini để
  - tạo tag và summary tự động cho bài đăng
  - hỗ trợ tìm kiếm AI
  - chatbot xử lý câu hỏi
- Recommendation service với hybrid score dựa trên
  - content-based
  - collaborative filtering từ favourite
  - tin VIP và độ mới

## Tính năng đã hoàn thiện

### Backend hoàn thiện
- Xác thực người dùng (register, login, logout, forgot password)
- Đăng nhập Google OAuth
- CRUD bài đăng
- Quản lý trạng thái bài đăng: active, pending, reject, draft
- Duyệt bài đăng, từ chối bài đăng
- Tạo favourite và truy vấn favourite của người dùng
- Mô hình review và API review cơ bản
- API violation / báo cáo vi phạm
- Recharge người dùng và theo dõi lịch sử nạp tiền
- Thanh toán MoMo và VNPAY với callback xử lý trạng thái thành công
- Tích hợp AI Gemini cho
  - metadata bài đăng (tags + summary)
  - tìm kiếm AI trong backend
  - chatbot trả lời câu hỏi qua socket
- Recommendation service đã triển khai trong backend
- Gửi thư điện tử: phê duyệt, từ chối, quên mật khẩu
- API dashboard thống kê giao dịch và doanh thu

### Frontend hoàn thiện
- Giao diện tìm kiếm và lọc phòng trọ
- Trang chi tiết bài đăng
- Form tạo bài đăng
- Trang quản lý bài viết và người dùng
- Tính năng favourite bài đăng
- Dashboard người dùng và quản trị
- Tích hợp chat realtime giao diện client
- Hệ thống thông báo / alert cơ bản

### Hệ thống chung
- Thư mục code rõ ràng: `client/`, `server/`
- Cấu trúc models, controllers, routes, services hợp lý
- Sử dụng Socket.io cho realtime chat
- Tích hợp AI và thanh toán thực tế

## Trạng thái hiện tại

### Đã hoàn thành
- Xây dựng ứng dụng full-stack frontend/backend hoạt động được
- Backend API đầy đủ cho hầu hết nghiệp vụ chính
- Xác thực JWT và Google OAuth
- Quản lý bài đăng, favourite, review, recharge
- Thanh toán MoMo và VNPAY
- AI metadata cho bài đăng và AI search
- Chat realtime qua Socket.io
- Recommendation service cơ bản hoạt động
- Email thông báo phê duyệt / từ chối và quên mật khẩu

### Chưa hoàn thiện / cần tiếp tục
- Hoàn thiện UI/UX cho review/violation nếu chưa đầy đủ
- Nâng cao logging, giám sát, audit hành động người dùng
- Mở rộng tính năng tìm lịch xem phòng

## Hướng dẫn cài đặt

### Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```
Mặc định backend lắng nghe trên `http://localhost:3000`.

### Frontend
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
Frontend khởi chạy trên `http://localhost:5173`.

### Docker Compose
```bash
cp .env.example .env
docker compose up --build
```
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:3001`
- MongoDB: `mongodb://localhost:27017`

## Công nghệ sử dụng

- Frontend: React, Vite, Ant Design, React Router, Socket.io Client, Sass
- Backend: Node.js, Express, Mongoose, MongoDB, JWT, dotenv
- AI: `@google/generative-ai` (Google Gemini)
- Thanh toán: `vnpay`, MoMo
- Realtime: `socket.io`

## Ghi chú

- Để chạy đầy đủ tính năng AI, cần cấu hình biến môi trường Google API Key.
- Để chạy thanh toán MoMo/VNPAY, cần cấu hình thông tin tài khoản và callback URL phù hợp.
- Dự án đang ở trạng thái hoàn thiện phần nền tảng, còn một số tính năng mở rộng và UI/UX cần hoàn thiện thêm.
