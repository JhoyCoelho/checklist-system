import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateChecklistPDFBuffer, buildChecklistHTML, buildJustificationHTML } from "@/lib/pdf";
import { sendChecklistEmail } from "@/lib/mail";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') return new Response('Não autorizado', { status: 401 });

  const body = await req.json();
  const { checklistId, image } = body;

  if (!checklistId || !image) return new Response('Dados inválidos', { status: 400 });

  // create admin signature
  const adminSig = await prisma.adminSignature.create({
    data: {
      checklistId,
      adminId: session.user.id,
      image
    }
  });

  // fetch checklist, answers, signature and justification
  const checklist = await prisma.checklist.findUnique({
    where: { id: checklistId },
    include: { user: true, answers: true, signature: true }
  });

  const justification = await prisma.justification.findFirst({ where: { checklistId }, include: { user: true } });

  if (!checklist) return new Response('Checklist não encontrado', { status: 404 });

  // build checklist pdf
  const questions = await prisma.checklistQuestion.findMany({ where: { templateId: checklist.templateId } });

  const items = checklist.answers.map(a => {
    const question = questions.find(q => q.id === a.questionId);
    const parsed = JSON.parse(a.answer || '{}');

    return {
      question: question?.question || 'Pergunta',
      status: parsed.status || parsed.text,
      observation: parsed.observation || parsed.text || a.observation || '-'
    };
  });

  const checklistHtml = buildChecklistHTML({
    user: checklist.user.name,
    date: checklist.createdAt.toLocaleString('pt-BR'),
    type: 'Checklist Técnico',
    signature: checklist.signature?.image,
    items
  });

  const checklistPdf = await generateChecklistPDFBuffer(checklistHtml);

  const attachments: { filename: string; content: Buffer }[] = [];
  attachments.push({ filename: 'checklist.pdf', content: Buffer.from(checklistPdf) });

  if (justification) {
    const jHtml = buildJustificationHTML({
      user: justification.user?.name || justification.userId,
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
      adminSignature: adminSig.image,
      adminName: session.user.name,
      createdAt: justification.createdAt.toLocaleString('pt-BR')
    });

    const jPdf = await generateChecklistPDFBuffer(jHtml);
    attachments.push({ filename: 'justification.pdf', content: Buffer.from(jPdf) });
  }

  const subject = `Checklist aprovado - ${checklist.user.name}`;

  await sendChecklistEmail(process.env.EMAIL_USER!, attachments, subject);

  // mark checklist as completed
  await prisma.checklist.update({ where: { id: checklistId }, data: { status: 'COMPLETED' } });

  return Response.json({ ok: true });
}
