// /src/app/admin/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // 🔒 proteção aqui
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const checklists = await prisma.checklist.findMany({
    include: {
      user: true,
      pdf: true
    }
  });

  return (
    <div>
      <h1>Admin</h1>

      {checklists.map(c => (
        <div key={c.id}>
          <p>{c.user.name}</p>
          <a href={c.pdf?.url} target="_blank">
            Ver PDF
          </a>
        </div>
      ))}
    </div>
  );
}