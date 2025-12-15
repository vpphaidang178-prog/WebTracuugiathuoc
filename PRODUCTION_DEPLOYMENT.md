# 🚀 Hướng dẫn Deploy Production

## ⚠️ Vấn đề phổ biến: "Không có quyền" sau khi deploy

### Nguyên nhân:
1. **NEXTAUTH_SECRET khác nhau** giữa local và production → JWT token cũ không valid
2. **Session không được refresh** từ database
3. User đăng nhập trên local → token không work trên production

### ✅ Giải pháp đã áp dụng:

#### 1. JWT Callback được cải thiện (lib/auth.ts)
- ✅ Tự động refresh `isAdmin` từ database mỗi lần verify token
- ✅ Kiểm tra trạng thái tài khoản (status) từ database
- ✅ Đảm bảo quyền admin luôn đúng, kể cả khi NEXTAUTH_SECRET thay đổi

#### 2. Environment Variables quan trọng

Cần set trên production platform (Vercel/Railway/etc):

```bash
# Database URL
DATABASE_URL="postgresql://..."

# NextAuth Secret (QUAN TRỌNG - phải khác local)
NEXTAUTH_SECRET="generate-bằng-openssl-rand-base64-32"

# NextAuth URL (domain production)
NEXTAUTH_URL="https://your-production-domain.com"

# Node Environment
NODE_ENV="production"
```

### 📋 Checklist Deploy Production:

- [ ] **1. Generate NEXTAUTH_SECRET mới:**
  ```bash
  openssl rand -base64 32
  ```
  
- [ ] **2. Set Environment Variables trên platform:**
  - `DATABASE_URL` → PostgreSQL production
  - `NEXTAUTH_SECRET` → Secret vừa generate
  - `NEXTAUTH_URL` → Domain production (https://...)
  - `NODE_ENV` → "production"

- [ ] **3. Deploy code lên production**

- [ ] **4. QUAN TRỌNG: Yêu cầu TẤT CẢ user đăng nhập lại**
  - JWT token cũ từ local không work trên production
  - Token mới sẽ có NEXTAUTH_SECRET đúng

- [ ] **5. Test quyền admin:**
  - Truy cập `/api/debug/session` để kiểm tra
  - Kiểm tra `isAdmin: true` trong response

### 🔍 Debug khi gặp lỗi:

#### Bước 1: Kiểm tra Session
```javascript
fetch('/api/debug/session')
  .then(r => r.json())
  .then(console.log)
```

Expected output:
```json
{
  "hasSession": true,
  "user": {
    "id": "...",
    "username": "admin",
    "isAdmin": true
  }
}
```

#### Bước 2: Nếu `isAdmin: false`
1. **Đăng xuất hoàn toàn** (clear cookies)
2. **Đăng nhập lại** trên production
3. Thử lại

#### Bước 3: Kiểm tra Database
```sql
SELECT id, username, isAdmin, status FROM "User" WHERE username = 'your-admin-username';
```

Đảm bảo:
- ✅ `isAdmin = true`
- ✅ `status = true` (không bị khóa)

### 🛠️ Platforms phổ biến:

#### Vercel:
```bash
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add DATABASE_URL
```

#### Railway:
Settings → Variables → Add:
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- DATABASE_URL

#### Heroku:
```bash
heroku config:set NEXTAUTH_SECRET="..."
heroku config:set NEXTAUTH_URL="https://yourapp.herokuapp.com"
```

### 📝 Notes:

1. **JWT Token được refresh tự động** từ database nhờ cải thiện mới
2. Mỗi lần user gọi API, `isAdmin` được verify từ database
3. Performance: Prisma caching giúp query nhanh
4. Security: Token invalidate tự động nếu tài khoản bị khóa

### ❓ Vẫn gặp vấn đề?

1. Check logs trên production platform
2. Verify environment variables: `console.log(process.env.NEXTAUTH_SECRET)`
3. Clear browser cookies và đăng nhập lại
4. Kiểm tra database có user admin không

---

**Cập nhật:** $(date +%Y-%m-%d)
**Fix:** JWT callback cải thiện để sync isAdmin từ database

