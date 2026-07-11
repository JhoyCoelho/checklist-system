import { prisma } from "@/lib/prisma";
import { generateChecklistPDFBuffer, buildChecklistHTML, buildJustificationHTML } from "@/lib/pdf";
import { sendChecklistEmail } from "@/lib/mail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return new Response("Não autorizado", { status: 401 });
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

    // If a justificationId was provided, link it to this checklist.
    if (body.justificationId) {
      await prisma.justification.update({
        where: { id: body.justificationId },
        data: { checklistId: checklist.id }
      });
    }

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

    const adminSig = await prisma.adminSignature.findUnique({ where: { checklistId: checklist.id } });
    const shouldSendImmediately = !body.justificationId || Boolean(adminSig);

    if (shouldSendImmediately) {
      const html = buildChecklistHTML({
        user: session.user.name,
        date: new Date().toLocaleString("pt-BR"),
        type: "Checklist Técnico",
        signature: body.signature,
        items
      });

      const checklistPdf = await generateChecklistPDFBuffer(html);
      let attachments: { filename: string; content: Buffer }[] = [];
      attachments.push({ filename: 'checklist.pdf', content: Buffer.from(checklistPdf) });

      if (body.justificationId) {
        const justification = await prisma.justification.findFirst({ where: { checklistId: checklist.id } });
        if (justification) {
          const jHtml = buildJustificationHTML({
            user: session.user.name,
            role: justification.role,
            checklistType: justification.checklistType,
            expectedDate: justification.expectedDate?.toLocaleString(),
            filledDate: justification.filledDate?.toLocaleString(),
            expectedTime: justification.expectedTime,
            filledTime: justification.filledTime,
            reason: justification.reason,
            otherReason: justification.otherReason,
            description: justification.description,
            signature: justification.signature,
            createdAt: justification.createdAt.toLocaleString('pt-BR')
          });

          const jPdf = await generateChecklistPDFBuffer(jHtml);
          attachments.push({ filename: 'justification.pdf', content: Buffer.from(jPdf) });
        }
      }

      const technicianName = session.user.name || session.user.email || "técnico";
      const subject = `Checklist preenchido - ${technicianName}`;

      await sendChecklistEmail(process.env.EMAIL_USER!, attachments, subject);
      return Response.json({ ok: true, sent: true });
    }

    return Response.json({ ok: true, pending: true });

  } catch (error) {
    return new Response("Erro interno do servidor", { status: 500 });
  }
}