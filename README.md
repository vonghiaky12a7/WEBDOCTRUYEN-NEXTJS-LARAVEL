# Tên Dự Án (Thay bằng tên dự án của bạn)

Dự án này bao gồm backend Laravel và frontend Next.js.

## Yêu Cầu

Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt các phần mềm sau:

- **PHP** (>= 8.1)
- **Composer**
- **MySQL** hoặc database tương thích khác
- **Node.js** (>= 16.x)
- **npm** hoặc **yarn**
- **Git**

## Cài Đặt Backend (Laravel)

### Cài Đặt Backend

1. **Clone repository:**

    ```bash
    git clone <đường-dẫn-repository-backend>
    cd <thư-mục-backend>
    ```

2. **Cài đặt dependencies:**

    ```bash
    composer install
    ```

### Cài Đặt Database Backend

1. **Tạo database** (ví dụ: `your_database_name`) trên MySQL server của bạn.
2. **Chạy migrations:**

    ```bash
    php artisan migrate
    ```

3. **Seed data (tùy chọn):**

    ```bash
    php artisan db:seed
    ```

### Chạy Backend

1. **Khởi động server:**

    ```bash
    php artisan serve
    ```

    Server thường chạy ở `http://localhost:8000`.

    **Sử dụng Nodemon (tùy chọn):** Để tự động reload khi thay đổi file PHP, dùng lệnh:

    ```bash
    nodemon --exec "php artisan serve" --ext php
    ```

## Cài Đặt Frontend (Next.js)

### Cài Đặt Frontend

1. **Clone repository:**

    ```bash
    git clone <đường-dẫn-repository-frontend>
    cd <thư-mục-frontend>
    ```

2. **Cài đặt dependencies:**

    ```bash
    npm install # hoặc yarn install
    ```

### Cấu Hình Frontend

1. **Sao chép file `.env.example` thành `.env.local`:**

    ```bash
    cp .env.example .env.local
    ```

2. **Sửa file `.env.local`:**
    - Đặt biến `NEXT_PUBLIC_API_URL` trỏ đến URL của backend Laravel (ví dụ: `http://localhost:8000`).

        ```
        NEXT_PUBLIC_API_URL=http://localhost:8000
        ```

    - Đặt các biến môi trường khác nếu cần.

### Chạy Frontend

1. **Khởi động server:**

    ```bash
    npm run dev # hoặc yarn dev
    ```

    Server thường chạy ở `http://localhost:3000`.

## Các Lệnh Laravel Thường Dùng (Tham Khảo)

- **Migrations:**
  - Tạo mới: `php artisan make:migration create_table_name` (hoặc `add_column_to_table_name --table=table_name`)
  - Chạy: `php artisan migrate`
  - Rollback: `php artisan migrate:rollback`
  - Fresh (rollback toàn bộ và chạy lại): `php artisan migrate:fresh`
  - Chạy file cụ thể: `php artisan migrate --path=/database/migrations/file_name.php`
- **Seeders:**
  - Tạo mới: `php artisan make:seeder SeederName`
  - Chạy: `php artisan db:seed` (hoặc `php artisan db:seed --class=SeederName`)
  - Fresh (reset và seed lại): `php artisan migrate:fresh --seed`
- **Models:**
  - Tạo mới: `php artisan make:model ModelName` (hoặc `-m` để tạo kèm migration, `-msfc` để tạo kèm migration, seeder, factory, controller)
- **Controllers:**
  - Tạo mới: `php artisan make:controller ControllerName` (hoặc `--resource` để tạo kèm CRUD)
- **Middleware:**
  - Tạo mới: `php artisan make:middleware MiddlewareName`
- **Factories:**
  - Tạo mới: `php artisan make:factory FactoryName --model=ModelName`
  - Chạy (trong Tinker): `php artisan tinker` rồi `ModelName::factory()->count(10)->create();`
- **Routes:**
  - Xem danh sách: `php artisan route:list`
- **Cache:**
  - Xóa toàn bộ: `php artisan cache:clear`, `php artisan config:clear`, `php artisan route:clear`, `php artisan view:clear`
- **Optimize:**
  - Tối ưu: `php artisan optimize`

## Lưu Ý

- Thay thế `<đường-dẫn-repository-backend>`, `<thư-mục-backend>`, `<đường-dẫn-repository-frontend>`, `<thư-mục-frontend>` bằng thông tin thực tế.
- Đảm bảo backend đã chạy trước khi chạy frontend.

## Liên Hệ

Nếu gặp vấn đề, hãy liên hệ với người quản lý dự án.
