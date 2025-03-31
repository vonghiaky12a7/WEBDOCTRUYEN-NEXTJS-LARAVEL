# Chạy server

php artisan serve

## Dùng Nodemon để tự động reload

nodemon --exec "php artisan serve" --ext php

📌 Migrations (Tạo & Chỉnh sửa database)

### Tạo migration (tạo bảng mới)

php artisan make:migration personal_access_tokens

## Tạo migration (thêm cột vào bảng có sẵn)

php artisan make:migration add_column_to_ratings_table --table=ratings

## Chạy tất cả migration

php artisan migrate

## Chạy migration theo file cụ thể

php artisan migrate --path=/database/migrations/2025_03_27_043734_create_chapters_table.php

## Rollback migration (Quay lại migration trước đó)

php artisan migrate:rollback

## Rollback toàn bộ migration và chạy lại từ đầu

php artisan migrate:fresh

## 📌 Seeder (Tạo dữ liệu giả)

## Tạo Seeder

php artisan make:seeder ChapterSeeder

## Chạy Seeder cụ thể

php artisan db:seed --class=ChapterSeeder

## Chạy tất cả Seeder trong DatabaseSeeder.php

php artisan db:seed

## Chạy lại Seeder (reset dữ liệu trước khi seed)

php artisan migrate:fresh --seed

## 📌 Model (Tạo & Quản lý Model)

## Tạo Model

php artisan make:model Chapter

## Tạo Model kèm migration

php artisan make:model Chapter -m

## Tạo Model kèm migration, factory, seeder, controller

php artisan make:model Chapter -msfc

## 📌 Controller (Quản lý logic của ứng dụng)

## Tạo Controller

php artisan make:controller ChapterController

## Tạo Controller kèm Resource (có sẵn CRUD)

php artisan make:controller ChapterController --resource

## 📌 Middleware (Lớp bảo vệ request)

## Tạo Middleware

php artisan make:middleware CheckRole

## 📌 Factory (Tạo dữ liệu giả cho testing)

## Tạo Factory

php artisan make:factory ChapterFactory --model=Chapter

## Chạy Factory tạo dữ liệu

php artisan tinker
>>> Chapter::factory()->count(10)->create();

## 📌 API & Routes

## Xem danh sách API routes

php artisan route:list

## 📌 Optimize & Clear Cache

## Clear cache toàn bộ

php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

## Tối ưu lại ứng dụng

php artisan optimize`
