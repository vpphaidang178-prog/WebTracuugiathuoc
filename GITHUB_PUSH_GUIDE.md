# Hướng dẫn Push Code lên GitHub

## Bước 1: Tạo Personal Access Token

GitHub không còn cho phép push bằng mật khẩu. Bạn cần tạo Personal Access Token:

1. Truy cập: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Đặt tên token: `Web App Push Token`
4. Chọn scope: ✅ **`repo`** (full control of private repositories)
5. Click **"Generate token"**
6. **SAO CHÉP TOKEN NGAY** (chỉ hiển thị một lần!)

## Bước 2: Push code lên GitHub

### Cách 1: Sử dụng Token trong URL (Khuyến nghị)

```bash
git remote set-url origin https://YOUR_TOKEN@github.com/vpphaidang178-prog/WebTracuuthuoctrungthau.git
git push -u origin main
```

Thay `YOUR_TOKEN` bằng token bạn vừa tạo.

### Cách 2: Push và nhập token khi được hỏi

```bash
git push -u origin main
```

Khi được hỏi:
- **Username**: `vpphaidang178-prog`
- **Password**: Dán Personal Access Token (KHÔNG phải mật khẩu GitHub)

## Bước 3: Kiểm tra

Sau khi push thành công, truy cập:
https://github.com/vpphaidang178-prog/WebTracuuthuoctrungthau

Bạn sẽ thấy code đã được upload lên GitHub.

## Lưu ý bảo mật

⚠️ **QUAN TRỌNG**: 
- Không commit file `.env` (đã có trong `.gitignore`)
- Không chia sẻ Personal Access Token
- Nếu token bị lộ, hãy xóa ngay trên GitHub và tạo token mới

## Troubleshooting

### Lỗi "Repository not found"
- Kiểm tra repository đã được tạo trên GitHub chưa
- Kiểm tra tên repository: `WebTracuuthuoctrungthau` (có đủ chữ "rung")
- Kiểm tra bạn có quyền truy cập repository

### Lỗi "Authentication failed"
- Kiểm tra token có scope `repo` chưa
- Kiểm tra token còn hạn chưa
- Tạo token mới nếu cần

### Lỗi "Permission denied"
- Đảm bảo token có quyền `repo` (full control)
- Kiểm tra bạn là owner hoặc có quyền write vào repository

