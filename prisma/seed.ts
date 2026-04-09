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
          { question: "Chave de fenda", type: "CHECKBOX" },
          { question: "Chave Philips", type: "CHECKBOX" },
          { question: "Clivador", type: "CHECKBOX" },
          { question: "Alicate de corte", type: "CHECKBOX" },
          { question: "Bolsa de ferramentas", type: "CHECKBOX" },
          { question: "Alicate decapador de fibra", type: "CHECKBOX" },
          { question: "Decapador de drop", type: "CHECKBOX" },
          { question: "Power meter", type: "CHECKBOX" },
          { question: "Caneta VFL", type: "CHECKBOX" },
          { question: "Lenços para limpeza de fibra", type: "CHECKBOX" },
          { question: "Dispenser com álcool isopropílico", type: "CHECKBOX" }
        ]
      }
    }
  });

  await prisma.checklistTemplate.create({
    data: {
      name: "Veículo",
      questions: {
        create: [
          { question: "Combustível suficiente", type: "CHECKBOX" },
          { question: "Pneus em bom estado", type: "CHECKBOX" },
          { question: "Documentação presente", type: "CHECKBOX" },
          { question: "Veículo limpo e organizado", type: "CHECKBOX" },
          { question: "Ferramentas armazenadas corretamente", type: "CHECKBOX" },
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