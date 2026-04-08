import { prisma } from "@/lib/prisma";
import { generateChecklistPDFBuffer } from "@/lib/pdf";
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

    const answers = Object.entries(body.answers).map(([id, value]) => ({
      checklistId: checklist.id,
      questionId: id,
      answer: String(value)
    }));

    await prisma.checklistAnswer.createMany({ data: answers });

    await prisma.signature.create({
      data: {
        checklistId: checklist.id,
        image: body.signature
      }
    });

    const html = `
      <h1>Checklist</h1>
      ${answers.map(a => `<p>${a.questionId}: ${a.answer}</p>`).join("")}
      <img src="${body.signature}" width="200"/>
    `;

    const pdf = await generateChecklistPDFBuffer(html);

    await sendChecklistEmail(process.env.EMAIL_USER!, pdf);

    return Response.json({ ok: true });

  } catch (error) {
    console.error(error);
    return new Response("Erro interno", { status: 500 });
  }
}