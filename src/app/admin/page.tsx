import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

type ChecklistWithRelations = Prisma.ChecklistGetPayload<{
  include: {
    user: true;
    signature: true;
  };
}>;

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const checklists: ChecklistWithRelations[] =
    await prisma.checklist.findMany({
      include: {
        user: true,
        signature: true
      }
    });

  return (
    <div>
      <h1>Admin</h1>

      {checklists.map(c => (
        <div key={c.id}>
          <p>{c.user.name}</p>

          {c.signature && (
            <img
              src={c.signature.image}
              alt="Assinatura"
              className="w-40 border"
            />
          )}
        </div>
      ))}
    </div>
  );
}