# Phongtro123

## Tổng quan

**Phongtro123** là hệ thống quản lý và tìm kiếm phòng trọ thông minh dành cho sinh viên, phát triển với mục tiêu giảm thiểu rủi ro "cò mồi", nhiễu thông tin và thời gian tìm kiếm khi thuê trọ tại các khu vực đô thị lớn như Hà Nội.

Đây là một ứng dụng web full-stack gồm:
- Frontend React/Vite
- Backend NodeJS/Express
- Công nghệ AI (LLM) để tự động gắn thẻ và tóm tắt nội dung bài đăng
- Hệ thống gợi ý Hybrid Recommendation System
- Thanh toán điện tử và tính năng nạp tiền cho người dùng

## Mục tiêu dự án

### Mục tiêu kỹ thuật
- Xây dựng hệ thống web hoàn chỉnh với giao diện hiện đại và API RESTful.
- Tích hợp Hybrid Recommendation System kết hợp Content-based và Collaborative Filtering.
- Sử dụng Large Language Model (LLM) để tạo metadata tự động cho bài đăng, bao gồm tag và summary.
- Cải thiện hệ thống bằng cơ chế xử lý lỗi (error handling) và logging.
- Hướng tới khả năng container hóa (Docker) và triển khai thực tế.

### Mục tiêu chức năng
- Hỗ trợ tìm kiếm phòng trọ theo giá, diện tích, tiện ích, loại tin, khu vực.
- Cung cấp tính năng đăng tin cho chủ nhà và tìm kiếm chuyên dụng cho sinh viên.
- Hiển thị mục "Phòng trọ dành riêng cho bạn" dựa trên dữ liệu người dùng.
- Kết nối chat trực tuyến giữa người dùng và chủ nhà thông qua Socket.io.
- Hỗ trợ quản lý duyệt tin, phân quyền và dashboard admin.

### Mục tiêu nghiệp vụ
- Thiết kế quy trình đăng tin, duyệt tin và phân quyền người dùng.
- Đảm bảo các chức năng CRUD cho bài đăng và người dùng.
- Tích hợp quy trình phê duyệt tin để nâng cao chất lượng nội dung.
- Hướng tới sản phẩm phù hợp với ba nhóm đối tượng: Sinh viên, Chủ nhà và Admin.

## Tính năng chính hiện tại

### Frontend
- Giao diện React + Vite + Ant Design.
- Trang tìm kiếm, trang chi tiết phòng trọ, trang quản lý người dùng.
- Form đăng bài với hỗ trợ AI gợi ý nội dung.
- Dashboard quản lý bài đăng và lịch sử nạp tiền.

### Backend
- API RESTful xây dựng bằng Express.
- Xác thực JWT và Google OAuth.
- Quản lý bài đăng, duyệt bài, từ chối bài, và hệ thống favourite.
- Thanh toán điện tử: VNPAY và MoMo.
- Tích hợp AI Search và AI metadata cho bài đăng.
- Chat realtime với Socket.io.

### Recommendation & AI
- Hệ thống gợi ý ban đầu sử dụng `recommendation.service.js` với:
  - Content-based scoring
  - Collaborative filtering dựa trên lịch sử favourite
  - Yếu tố phụ trợ: tin VIP và độ mới
- Tích hợp LLM Gemini để chỉnh sửa metadata bài đăng tự động qua hàm `AiGenerateTagsAndSummary`.

## Kiến trúc hệ thống

### Cấu trúc thư mục
- `client/`: Frontend React/Vite.
- `server/`: Backend NodeJS/Express.
- `server/src/controllers`: Định nghĩa logic API.
- `server/src/models`: Mongoose schema.
- `server/src/routes`: Khai báo route.
- `server/src/services`: Logic nghiệp vụ, recommendation, socket, token.
- `server/src/utils/AISearch`: Tích hợp LLM và AI Search.

## Hướng dẫn cài đặt

### Thiết lập backend
```bash
cd server
npm install
npm run dev
```
Backend khởi chạy tại `http://localhost:3000`.

### Thiết lập frontend
```bash
cd client
npm install
npm run dev
```
Frontend khởi chạy tại `http://localhost:5173`.

## Trạng thái hiện tại

### Hoàn thành
- Frontend cơ bản với tìm kiếm, chi tiết, quản lý bài đăng.
- Backend API RESTful, xác thực người dùng và phân quyền admin.
- Chức năng đăng bài, duyệt bài, xóa bài.
- Tìm kiếm và lọc theo nhiều tiêu chí.
- Hệ thống favourite.
- Chat realtime.
- AI Search và metadata tự động cho bài đăng.
- Nạp tiền / recharge user.

### Cần tiếp tục hoàn thiện
- Hoàn thiện Hybrid Recommendation System theo đề cương.
- Xây dựng hệ thống review/rating phòng trọ.
- Thêm tính năng export báo cáo Excel/PDF.
- Phân định rõ vai trò Sinh viên / Chủ nhà.
- Container hóa với Docker / Docker Compose.
- Cân nhắc chuyển hoặc bổ sung PostgreSQL theo đề cương.
- Xây dựng logging chuyên sâu và báo cáo phân tích dữ liệu.
- Hoàn thiện sơ đồ nghiệp vụ (BPMN / Use Case).
- Thêm tính năng tìm người ở ghép.
- Quản lý vi phạm / báo cáo vi phạm.

## Công nghệ sử dụng

- Frontend: React, Vite, Ant Design, React Router, Socket.io Client.
- Backend: Node.js, Express, Mongoose, Socket.io, JWT, dotenv.
- AI: `@google/generative-ai` (Gemini).
- Thanh toán: `vnpay`, MoMo.
- Database: MongoDB.

## Định hướng mở rộng

1. Triển khai Docker và thiết kế môi trường deploy.
2. Tối ưu recommendation engine và bổ sung dữ liệu huấn luyện.
3. Hoàn thiện hệ thống role-based access với Sinh viên / Chủ nhà / Admin.
4. Thêm review, rating, lịch xem phòng và tìm người ở ghép.
5. Cung cấp báo cáo quản trị và phân tích dữ liệu cho admin.

## Tài liệu tham khảo

- [Google Gemini API](https://ai.google.dev/gemini-api/docs?hl=vi)
- [Google Maps Platform Documentation](https://developers.google.com/maps/apis-by-platform?hl=vi)
- [Recommendation System cơ bản](https://machinelearningcoban.com/2017/05/17/contentbasedrecommendersys/)
- [Docker/DevOps cho microservices](https://viblo.asia/p/banking-demo-full-devops-voi-microservices-trien-khai-voi-docker-compose-bA468ekXLKv)

## Thông tin tác giả

- **Hoàng Anh Khoa**
- Lớp: 64HTTT4
- MSSV: 2251162045
- Email: 2251162045@e.tlu.edu.vn
- Giáo viên hướng dẫn: TS. Đỗ Oanh Cường
- Email GVHD: cuongdo@tlu.edu.vn
