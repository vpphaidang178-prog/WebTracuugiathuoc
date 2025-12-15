import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Tạo admin user mặc định
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      fullName: "Ban quản trị",
      phone: "0123456789",
      isAdmin: true,
    },
  });

  console.log("Đã tạo admin user:", admin);

  // Tạo user thường mặc định
  const userPassword = await bcrypt.hash("user123", 10);

  const user = await prisma.user.upsert({
    where: { username: "user" },
    update: {},
    create: {
      username: "user",
      password: userPassword,
      fullName: "Đơn vị test",
      phone: "0987654321",
      isAdmin: false,
    },
  });

  console.log("Đã tạo user thường:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

