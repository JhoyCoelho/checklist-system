import { prisma } from "../src/lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  const passwordHash = await bcrypt.hash("#Fyber3656", 10);

  const user = await prisma.user.create({
    data: {
      name: "Fyber admin",
      email: "fyberlinkprovedor@gmail.com",
      password: passwordHash,
      role: "ADMIN"
    }
  });

  console.log("Usuário criado:", user);
}

main();