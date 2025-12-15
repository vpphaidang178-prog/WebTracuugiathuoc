# Hướng dẫn Deploy lên Vercel

## Các bước deploy

### 1. Chuẩn bị repository
- Đảm bảo code đã được push lên GitHub
- Repository: `https://github.com/vpphaidang178-prog/WebTracuugiathuoc`

### 2. Tạo project trên Vercel
1. Đăng nhập vào [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import repository từ GitHub
4. Chọn repository `WebTracuugiathuoc`

### 3. Cấu hình biến môi trường (Environment Variables)

**QUAN TRỌNG**: Bạn PHẢI thêm các biến môi trường sau trong Vercel Dashboard:

#### Trong Vercel Dashboard → Project Settings → Environment Variables:

1. **DATABASE_URL**
   - Value: URL kết nối PostgreSQL của bạn (ví dụ: `postgresql://user:password@host:5432/database?schema=public`)
   - Environments: Production, Preview, Development

2. **NEXTAUTH_URL**
   - Value: URL của ứng dụng trên Vercel (ví dụ: `https://your-app.vercel.app`)
   - Environments: Production, Preview, Development

3. **NEXTAUTH_SECRET**
   - Value: Một chuỗi bí mật ngẫu nhiên (có thể generate bằng: `openssl rand -base64 32`)
   - Environments: Production, Preview, Development

### 4. Cấu hình Build Settings

Vercel sẽ tự động detect Next.js, nhưng đảm bảo:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (mặc định)
- **Output Directory**: `.next` (mặc định)
- **Install Command**: `npm install` (mặc định)

### 5. Cấu hình Prisma

Vercel cần generate Prisma Client trong quá trình build. Thêm script vào `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### 6. Deploy

1. Click "Deploy"
2. Vercel sẽ tự động:
   - Install dependencies
   - Run `prisma generate`
   - Run `npm run build`
   - Deploy ứng dụng

### 7. Chạy migrations sau khi deploy

Sau khi deploy thành công, bạn cần chạy migrations trên database production:

```bash
npx prisma db push
```

Hoặc nếu bạn có access vào Vercel CLI:
```bash
vercel env pull
npx prisma db push
```

## Xử lý lỗi thường gặp

### Lỗi: "Failed to collect page data for /api/auth/[...nextauth]"

**Đã được sửa** trong code:
- Thêm `export const dynamic = 'force-dynamic'` trong route handler
- Thêm `export const runtime = 'nodejs'` trong route handler
- Tắt Prisma query log trong production

### Lỗi: "Prisma Client not generated"

Thêm script `postinstall` vào `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

### Lỗi: "NEXTAUTH_SECRET is missing"

Đảm bảo đã thêm biến môi trường `NEXTAUTH_SECRET` trong Vercel Dashboard.

### Lỗi: "Database connection failed"

Kiểm tra:
1. `DATABASE_URL` đã được thêm vào Environment Variables
2. Database server cho phép kết nối từ Vercel IPs
3. Credentials trong `DATABASE_URL` là đúng

## Kiểm tra sau khi deploy

1. Truy cập URL của ứng dụng
2. Kiểm tra trang login hoạt động
3. Kiểm tra API routes hoạt động
4. Kiểm tra database connection

## Lưu ý

- Database phải accessible từ internet (không phải localhost)
- Nếu dùng database local, cần dùng service như Supabase, Neon, hoặc Railway
- Đảm bảo tất cả biến môi trường đã được set trước khi deploy
- Sau khi thay đổi biến môi trường, cần redeploy

