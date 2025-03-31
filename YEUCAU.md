# Hướng Dẫn Quy Tắc Commit

## Cấu Trúc Commit Message

```
<Loại commit (bắt buộc)> [phạm vi (tuỳ chọn)]: <Mô tả commit (bắt buộc)>

[Body (tuỳ chọn)]
[Footer (tuỳ chọn)]
```

### 1. Loại Commit (bắt buộc)

Xác định mục đích chính của commit. Các loại bao gồm:

- **feature**: Thêm tính năng mới.
- **bugfix**: Sửa lỗi.
- **refactor**: Tái cấu trúc mã nguồn mà không thay đổi chức năng.
- **docs**: Cập nhật tài liệu.
- **chore**: Những thay đổi nhỏ không liên quan đến mã nguồn.
- **style**: Thay đổi về định dạng mà không làm thay đổi hành vi của code.
- **perf**: Cải thiện hiệu suất của ứng dụng.
- **vendor**: Cập nhật phiên bản cho các thư viện.


## Ví Dụ Commit Message

### 1. Thêm tính năng đổi mật khẩu cho tài khoản người dùng

```
feature(user_profile): Thêm tính năng đổi mật khẩu cho tài khoản người dùng

[Yêu cầu: Đổi mật khẩu phải khác mật khẩu cũ và phân biệt chữ hoa, chữ thường]
```

### 2. Sửa lỗi địa chỉ văn phòng

```
bugfix(landing_page): Sửa lỗi địa chỉ văn phòng

[Địa chỉ văn phòng được ghi chính xác]
[Đề xuất của giám đốc]
```
