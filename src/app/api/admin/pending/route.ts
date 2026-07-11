import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return new Response("Não autorizado", { status: 401 });
  }

  const pending = await prisma.justification.findMany({
    where: {
      checklistId: { not: null },
      checklist: { adminSignature: null }
    },
    include: { user: true, checklist: true }
  });

  return Response.json({ ok: true, pending });
}
