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

  await prisma.checklistTemplate.create({
    data: {
      name: "Ferramentas",
      questions: {
        create: [
          { question: "Alicate presente?", type: "CHECKBOX" },
          { question: "Chave de fenda presente?", type: "CHECKBOX" },
          { question: "Observações", type: "TEXT" }
        ]
      }
    }
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });