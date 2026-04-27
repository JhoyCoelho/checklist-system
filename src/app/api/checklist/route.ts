import { prisma } from "@/lib/prisma";
import { generateChecklistPDFBuffer } from "@/lib/pdf";
import { buildChecklistHTML } from "@/lib/pdf";
import { sendChecklistEmail } from "@/lib/mail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const checklist = await prisma.checklist.create({
      data: {
        userId: session.user.id,
        templateId: body.templateId
      }
    });

    const answersArray = Object.entries(body.answers).map(
      ([questionId, value]: any) => ({
        checklistId: checklist.id,
        questionId,
        answer: JSON.stringify(value)
      })
    );

    await prisma.checklistAnswer.createMany({ data: answersArray });

    await prisma.signature.create({
      data: {
        checklistId: checklist.id,
        image: body.signature
      }
    });

    const questions = await prisma.checklistQuestion.findMany({
      where: { templateId: body.templateId }
    });

    const items = Object.entries(body.answers).map(
      ([questionId, value]: any) => {
        const question = questions.find(q => q.id === questionId);

        return {
          question: question?.question || "Pergunta",
          status: value.status || value.text,
          observation: value.observation || value.text || "-"
        };
      }
    );

    const html = buildChecklistHTML({
      user: session.user.name,
      date: new Date().toLocaleString("pt-BR"),
      type: "Checklist Técnico",
      signature: body.signature,
      items
    });

    const pdf = await generateChecklistPDFBuffer(html);

    await sendChecklistEmail(
      process.env.EMAIL_USER!,
      Buffer.from(pdf)
    );

    return Response.json({ ok: true });

  } catch (error) {
    console.error(error);
    return new Response("Erro interno", { status: 500 });
  }
}