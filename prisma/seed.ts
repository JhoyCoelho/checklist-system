// /prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("123456", 10);

  await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@admin.com",
      password,
      role: "ADMIN"
    }
  });

  console.log("Usuário admin criado");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());