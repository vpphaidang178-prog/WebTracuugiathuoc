# Hệ thống Tra cứu Giá Trúng Thầu

Ứng dụng web tra cứu giá trúng thầu thuốc theo VSS và MSC.

## Công nghệ sử dụng

- **Frontend**: React.js với Next.js App Router
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS

## Cài đặt

### Yêu cầu

- Node.js 18+ 
- PostgreSQL 12+
- npm hoặc yarn

### Bước 1: Clone project

```bash
cd "F:\Web app trung thau"
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Cấu hình database

Tạo database PostgreSQL với tên `giathuoctrungthau_db`

File `.env` đã được tạo với cấu hình:

```
DATABASE_URL="postgresql://postgres:123456@localhost:5432/giathuoctrungthau_db?schema=public"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production-123456789
```

### Bước 4: Chạy migration và seed

```bash
npx prisma db push
npm run seed
```

### Bước 5: Chạy ứng dụng

```bash
npm run dev
```

Truy cập: http://localhost:3000

## Tài khoản mặc định

Sau khi chạy seed, bạn có thể đăng nhập với:

**Admin:**
- Tên đăng nhập: `admin`
- Mật khẩu: `admin123`

**User thường:**
- Tên đăng nhập: `user`
- Mật khẩu: `user123`

## Cấu trúc dự án

```
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # NextAuth configuration
│   │   ├── users/             # User management API
│   │   ├── thuoc-vss/         # VSS drugs API
│   │   └── thuoc-msc/         # MSC drugs API
│   ├── dashboard/             # Dashboard pages
│   │   ├── admin/             # Admin pages
│   │   │   └── users/         # User management
│   │   ├── thuoc-vss/         # VSS drugs lookup
│   │   └── thuoc-msc/         # MSC drugs lookup
│   ├── login/                 # Login page
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── components/                # React components
│   └── SessionProvider.tsx    # Session provider
├── lib/
│   └── prisma.ts              # Prisma client
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding
└── public/                    # Static files
```

## Tính năng

### 1. Xác thực người dùng
- Đăng nhập/Đăng xuất
- Phân quyền Admin/User
- Session management với NextAuth

### 2. Quản trị (Admin)
- Quản lý người dùng (CRUD)
- Thêm/Sửa/Xóa người dùng
- Phân quyền admin

### 3. Tra cứu thuốc

#### Giá trúng thầu theo VSS
Hiển thị các thông tin:
- Thông tin cơ bản: Tên thuốc, hoạt chất, hàm lượng
- Thông tin đăng ký: GĐKLH, đường dùng, dạng bào chế
- Thông tin sản xuất: Cơ sở sản xuất, nước sản xuất
- Thông tin trúng thầu: Đơn vị trúng thầu, nhà thầu, số quyết định
- Giá và số lượng

#### Giá trúng thầu theo MSC
Hiển thị các thông tin:
- Thông tin cơ bản: Tên thuốc, hoạt chất, hàm lượng
- Thông tin đăng ký: GĐKLH, đường dùng, dạng bào chế, hạn dùng
- Thông tin sản xuất: Cơ sở sản xuất, nước sản xuất
- Thông tin đấu thầu: Mã TBMT, chủ đầu tư, hình thức LCNT
- Thông tin quyết định: Số quyết định, ngày ban hành
- Giá và số lượng

### 4. Tính năng chung
- Tìm kiếm theo tên thuốc, hoạt chất, cơ sở sản xuất
- Phân trang dữ liệu
- Chọn nhiều dòng với checkbox
- Responsive design

## Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm start` - Chạy production server
- `npm run seed` - Seed database với dữ liệu mẫu
- `npm run lint` - Kiểm tra code

## Database Schema

### User
- Quản lý người dùng
- Xác thực và phân quyền

### ThuocVSS
- Danh mục thuốc theo VSS
- 23 trường thông tin

### ThuocMSC
- Danh mục thuốc theo MSC
- 23 trường thông tin

## Bảo mật

- Mật khẩu được hash với bcrypt
- Session-based authentication với NextAuth
- Protected routes và API endpoints
- Role-based access control (Admin/User)

## License

MIT





