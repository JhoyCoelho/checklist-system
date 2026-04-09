import { prisma } from "@/lib/prisma";

export async function GET() {
  const templates = await prisma.checklistTemplate.findMany({
    include: {
      questions: true
    }
  });

  return Response.json(templates);
}