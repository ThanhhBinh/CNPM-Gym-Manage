# Hệ Thống Quản Lý Phòng Gym (Gym Management MVP)

Dự án MVP Quản lý phòng tập Gym được xây dựng trên kiến trúc Docker hóa đầy đủ với Backend Laravel 11 và Frontend React (Vite + TypeScript + Tailwind CSS 4).

## 🚀 Tính Năng Chính
- **Quản lý hội viên (Members)**: CRUD hội viên, tự động tạo QR Code kiểm soát check-in.
- **Quản lý gói tập (Packages)**: Định nghĩa gói tháng, quý, năm, PT, có tính năng nhân bản gói.
- **Đăng ký & Check-in**:
  - Đăng ký mua/gia hạn/bảo lưu gói tập cho hội viên.
  - Quét QR Code để Check-in (hoặc Check-in thủ công qua Mã hội viên).
  - Kiểm tra 5 điều kiện check-in nghiêm ngặt (khóa, hết hạn, chưa kích hoạt, v.v.).
- **Quản lý thanh toán & Hoá đơn**:
  - Ghi nhận thanh toán và chiết khấu.
  - Xuất hoá đơn PDF (DomPDF).
  - Xử lý hoàn tiền (Refund).
- **Tính năng nâng cao**:
  - Tự động quét và đánh dấu hết hạn gói tập qua Scheduler Command.
  - Ghi vết hành động (Audit Log) phục vụ bảo mật.

---

## 🛠️ Yêu Cầu Hệ Thống
Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
1. **Docker Desktop** (hoặc Docker Engine & Docker Compose).
2. **Git** (để quản lý mã nguồn).

---

## 🏗️ Hướng Dẫn Khởi Chạy Nhanh (Quick Start)

Làm theo các bước dưới đây để khởi chạy dự án thông qua Docker:

### Bước 1: Clone dự án và truy cập thư mục
```bash
git clone <repository_url>
cd CNPM-Gym-Manage
```

### Bước 2: Tạo tệp môi trường `.env`
Sao chép tệp cấu hình mẫu cho Backend:
```bash
cp backend/.env.example backend/.env
```

### Bước 3: Build và khởi động các Container
Sử dụng Docker Compose để khởi chạy dịch vụ (MySQL, Laravel, React):
```bash
docker compose up -d --build
```
> **Lưu ý**: Lệnh này sẽ mất vài phút trong lần chạy đầu tiên để cài đặt các package Composer và NPM.

### Bước 4: Chạy Migrations và Seed Dữ liệu
Cài đặt cấu trúc cơ sở dữ liệu và nạp dữ liệu mẫu (Tài khoản admin, lễ tân, gói tập mẫu):
```bash
# Thực hiện migrate và seed dữ liệu vào database MySQL
docker exec -it gym_backend php artisan migrate --seed
```

### Bước 5: Truy cập ứng dụng
Sau khi các bước trên hoàn tất, bạn có thể truy cập hệ thống qua trình duyệt:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)

---

## 🔑 Tài Khoản Đăng Nhập Thử Nghiệm

Hệ thống đã được nạp sẵn 2 tài khoản test với các phân quyền khác nhau:

| Vai trò (Role) | Số điện thoại (Phone) | Mật khẩu (Password) | Quyền hạn chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `0901234567` | `password` | Quản lý toàn bộ, khóa hội viên, nhân bản gói tập, hoàn tiền hóa đơn. |
| **Lễ tân (Receptionist)** | `0909876543` | `password` | Đăng ký hội viên, mua/gia hạn gói, quét check-in, xem hóa đơn. |

---

## 🧪 Chạy Unit & Feature Tests

Để chạy toàn bộ các bài kiểm thử tự động của Laravel (Sử dụng SQLite in-memory độc lập):
```bash
docker exec -it gym_backend php artisan test
```

---

## 📂 Cấu Trúc Thư Mục Dự Án
- `backend/`: Mã nguồn Laravel 11 (API, Models, Migrations, Seeders, Feature Tests).
- `frontend/`: Mã nguồn React (Vite, TypeScript, Tailwind CSS 4).
- `docker-compose.yml`: Cấu hình Docker Compose để liên kết các dịch vụ.
