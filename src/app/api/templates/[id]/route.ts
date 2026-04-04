import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: any) {
  const template = await prisma.checklistTemplate.findUnique({
    where: { id: params.id },
    include: {
      questions: true
    }
  });

  return Response.json(template);
}