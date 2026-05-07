# Phongtro123 - Hệ thống quản lý và tìm kiếm phòng trọ thông minh

## Giới thiệu

**Phongtro123** là một hệ thống quản lý và tìm kiếm phòng trọ dành cho sinh viên, được xây dựng để giải quyết các vấn đề thường gặp khi tìm thuê trọ ở thành phố lớn như Hà Nội. Dự án kết hợp frontend React/Vite và backend NodeJS/Express, đồng thời ứng dụng công nghệ AI để cải thiện trải nghiệm tìm kiếm và gợi ý phòng trọ.

## Mục tiêu chính

### Về kỹ thuật
- Xây dựng website hoàn chỉnh với Frontend React/Vite và Backend NodeJS/Express.
- Ứng dụng hệ thống gợi ý Hybrid Recommendation System, kết hợp Content-based và Collaborative Filtering.
- Sử dụng LLM (Large Language Model) để tự động gắn thẻ (tagging) và tóm tắt nội dung bài đăng.
- Triển khai giải pháp logging và error handling cho hệ thống.
- Hướng tới container hóa ứng dụng bằng Docker (nếu triển khai sau này).

### Về chức năng
- Hỗ trợ tìm kiếm phòng trọ trực quan, lọc theo giá, diện tích, tiện ích, loại tin và khu vực.
- Cung cấp tính năng đăng tin cho chủ nhà và tìm kiếm dành cho sinh viên.
- Tạo gợi ý "Phòng trọ dành riêng cho bạn" dựa trên hành vi người dùng.
- Tích hợp chat/messenger realtime.
- Hỗ trợ quản lý duyệt tin đăng và phân quyền người dùng.

### Về nghiệp vụ
- Xây dựng quy trình nghiệp vụ liên quan đến đăng tin, duyệt tin và quản lý người dùng.
- Hỗ trợ các chức năng CRUD (Thêm, Sửa, Xóa, Xem).
- Mở rộng dự án theo hướng hoàn chỉnh cho 3 đối tượng: Sinh viên, Chủ nhà, Admin quản trị.

## Tổng quan tính năng hiện tại

### Backend
- API RESTful với Express.
- Xác thực JWT và Google OAuth.
- Quản lý bài đăng, duyệt tin, phê duyệt, hủy bài.
- Hệ thống favourite, recharge user, thanh toán VNPAY/MoMo.
- Gọi AI Search và AI tagging/summary khi tạo bài đăng.
- Socket.io cho chat/messenger realtime.

### Frontend
- React + Vite + Ant Design.
- Trang tìm kiếm, trang chi tiết bài đăng, trang quản lý cá nhân, trang admin.
- Form tạo bài đăng có tích hợp AI gợi ý nội dung.
- Dashboard quản lý bài đăng và lịch sử nạp tiền.

### Recommendation & AI
- `recommendation.service.js` hỗ trợ gợi ý Hybrid với:
  - content-based score dựa trên category, giá, diện tích, địa điểm, tags, options.
  - collaborative score dựa trên favourite history.
  - bonus theo độ mới và tin VIP.
- `AiGenerateTagsAndSummary` dùng Gemini để tạo summary và tags tự động cho bài đăng.

## Cách cài đặt và chạy dự án

### 1. Backend
```bash
cd server
npm install
npm run dev
```
Mặc định backend chạy tại `http://localhost:3000`.

### 2. Frontend
```bash
cd client
npm install
npm run dev
```
Mặc định frontend chạy tại `http://localhost:5173`.

## Kiến trúc dự án

### Thư mục chính
- `client/`: Frontend React/Vite.
- `server/`: Backend NodeJS/Express.
- `server/src/controllers`: Điều khiển logic cho API.
- `server/src/models`: Mongoose schema cho dữ liệu.
- `server/src/routes`: Định nghĩa route API.
- `server/src/services`: Logic business, recommendation, socket, token.
- `server/src/utils/AISearch`: Tích hợp LLM cho tìm kiếm và metadata.

## Phần đã hoàn thiện
- Frontend React/Vite với giao diện tìm kiếm, chi tiết, quản lý người dùng.
- Backend NodeJS/Express với API REST, xác thực người dùng, phân quyền admin.
- Chức năng đăng bài, xem bài, xóa bài, duyệt bài, từ chối bài.
- Tìm kiếm và lọc bài đăng theo `category`, `priceRange`, `areaRange`, `typeNews`.
- Hệ thống favourite cho người dùng.
- Chat realtime với socket.io.
- AI Search và endpoint `/ai-search`.
- Trang nạp tiền / recharge user.
- Middleware xử lý lỗi chung.
- AI tagging và AI summary khi tạo bài.
- Recommendation System gốc đang triển khai.

## Phần cần hoàn thiện
- Recommendation System cần phát triển thêm để đạt chuẩn đề cương.
- Hệ thống review/rating phòng trọ.
- Export báo cáo Excel/PDF cho Admin.
- Vai trò `Sinh viên` / `Chủ nhà` rõ ràng hơn.
- Docker / Docker Compose triển khai.
- Chuyển hoặc bổ sung PostgreSQL nếu theo đề cương.
- Logging chuyên sâu và báo cáo phân tích dữ liệu.
- Sơ đồ nghiệp vụ (BPMN / Use Case) trong repo.
- Tính năng tìm người ở ghép chuyên biệt.
- Quản lý vi phạm / báo cáo vi phạm.

## Công nghệ sử dụng

- Frontend: React, Vite, Ant Design, React Router, Socket.io Client.
- Backend: Node.js, Express, Mongoose, Socket.io, JWT, dotenv.
- AI: `@google/generative-ai` (Gemini).
- Thanh toán: `vnpay`, MoMo API.
- Database: MongoDB/Mongoose.

## Lộ trình và tiến độ dự kiến

1. Khảo sát trang phòng trọ, phân tích nghiệp vụ và xác định yêu cầu.
2. Thiết kế database và sơ đồ hệ thống.
3. Xây dựng frontend và backend cơ bản.
4. Triển khai Hybrid Recommendation System và tích hợp LLM.
5. Tích hợp bản đồ, logging, kiểm thử hệ thống.
6. Thu thập dữ liệu thực nghiệm và đánh giá mô hình.
7. Hoàn thiện báo cáo, slide, demo.

## Tài liệu tham khảo

- [Google Gemini API](https://ai.google.dev/gemini-api/docs?hl=vi)
- [Google Maps Platform Documentation](https://developers.google.com/maps/apis-by-platform?hl=vi)
- [Recommendation System cơ bản](https://machinelearningcoban.com/2017/05/17/contentbasedrecommendersys/)
- [Docker/DevOps cho microservices](https://viblo.asia/p/banking-demo-full-devops-voi-microservices-trien-khai-voi-docker-compose-bA468ekXLKv)

## Liên hệ

- **Hoàng Anh Khoa**
- Lớp: 64HTTT4
- MSSV: 2251162045
- Email: 2251162045@e.tlu.edu.vn
- Giáo viên hướng dẫn: TS. Đỗ Oanh Cường
- Email GVHD: cuongdo@tlu.edu.vn
