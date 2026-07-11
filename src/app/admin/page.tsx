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

  const pendingCount = await prisma.justification.count({
    where: { checklistId: { not: null }, checklist: { adminSignature: null } }
  });

  return (
    <div>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Admin</h1>

        <div className="mt-4">
          <a href="/admin/pending" className="inline-block bg-red-600 text-white px-4 py-2 rounded">
            Aguardando confirmação: <span className="font-bold">{pendingCount}</span>
          </a>
        </div>

        <div className="mt-8">
          <h2 className="font-semibold">Últimos checklists</h2>
          {checklists.map(c => (
            <div key={c.id} className="mt-3 p-3 border rounded">
              <p className="font-medium">{c.user.name}</p>

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
      </div>
    </div>
  );
}