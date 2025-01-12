# Budget Buddy

Ứng dụng quản lý chi tiêu cá nhân với backend Python Flask và frontend Next.js.

## Tổng quan hệ thống

### Kiến trúc

- Backend: Python Flask
- Frontend: Next.js
- Database: PostgreSQL
- Authentication: JWT
- Scheduling: APScheduler

### Cấu trúc thư mục

- `backend/`: Backend API
    - `requirements.txt`: Các thư viện cần thiết cho backend
    - `app.py`: File chính của backend
    - `models/`: Các file liên quan đến cơ sở dữ liệu và các model
    - `routes/`: Các file liên quan đến các API
    - `services/`: Các file liên quan đến các dịch vụ
    - `utils/`: Các file liên quan đến các hàm hỗ trợ
- `frontend/`: Frontend Next.js
    - `src/`: Các file liên quan đến frontend
    - `public/`: Các file tài nguyên cố định
    - `styles/`: Các file liên quan đến CSS
    - `components/`: Các file liên quan đến các thành phần UI
    - `pages/`: Các file liên quan đến các trang
    - `utils/`: Các file liên quan đến các hàm hỗ trợ
- `docker-compose.yml`: Docker Compose file

## Cài đặt và Chạy

### Yêu cầu hệ thống
- Python 3.9+
- Node.js 18+
- PostgreSQL 12+

### 1. Cài đặt Database bằng Docker

```bash
docker compose up -d
```

### 2. Tạo và kích hoạt môi trường ảo

```bash
python -m venv venv
source venv/bin/activate
```

### 3. Cài đặt các thư viện cho backend

```bash
pip install -r backend/requirements.txt
```

### 4. Tạo file .env

```bash
cp .env.example .env
```

### 5. Cập nhật các biến môi trường trong .env

### 6. Chạy migration

```bash
flask db upgrade
```

### 7. Chạy server

```bash
python backend/app.py
```

### 8. Chạy frontend

```bash
cd frontend
npm install
npm run dev
```

### 9. Truy cập ứng dụng

Mở trình duyệt và truy cập vào địa chỉ `http://localhost:3000`.