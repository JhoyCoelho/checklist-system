import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
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
          { question: "Chave de fenda", type: "STATUS" },
          { question: "Chave Philips", type: "STATUS" },
          { question: "Clivador", type: "STATUS" },
          { question: "Alicate de corte", type: "STATUS" },
          { question: "Bolsa de ferramentas", type: "STATUS" },
          { question: "Alicate decapador de fibra", type: "STATUS" },
          { question: "Decapador de drop", type: "STATUS" },
          { question: "Power meter", type: "STATUS" },
          { question: "Caneta VFL", type: "STATUS" },
          { question: "Lenços para limpeza de fibra", type: "STATUS" },
          { question: "Dispenser com álcool isopropílico", type: "STATUS" }
        ]
      }
    }
  });

  await prisma.checklistTemplate.create({
    data: {
      name: "Veículo",
      questions: {
        create: [
          { question: "Combustível suficiente", type: "YES_NO" },
          { question: "Pneus em bom estado", type: "YES_NO" },
          { question: "Documentação presente", type: "YES_NO" },
          { question: "Veículo limpo e organizado", type: "YES_NO" },
          { question: "Ferramentas armazenadas corretamente", type: "YES_NO" },
          { question: "Observações gerais", type: "TEXT" }
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