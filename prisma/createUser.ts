import { prisma } from "../src/lib/prisma.ts";
import bcrypt from "bcrypt";

async function main() {
  const passwordHash = await bcrypt.hash("jhoycoelho0602", 10);

  const user = await prisma.user.create({
    data: {
      name: "JHOY THIAGO COELHO",
      email: "jhoy.thiago15@gmail.com",
      password: passwordHash,
      role: "ADMIN"
    }
  });

  console.log("Usuário criado:", user);
}

main();