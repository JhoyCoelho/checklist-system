import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildJustificationHTML, generateChecklistPDFBuffer } from "@/lib/pdf";
import { sendChecklistEmail } from "@/lib/mail";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) return new Response("Não autorizado", { status: 401 });

  const body = await req.json();

  // cria justificativa no DB
  const justification = await prisma.justification.create({
    data: {
      userId: session.user.id,
      role: session.user.role || "",
      checklistType: body.checklistType,
      expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,
      filledDate: body.filledDate ? new Date(body.filledDate) : null,
      expectedTime: body.expectedTime,
      filledTime: body.filledTime,
      reason: body.reason,
      otherReason: body.otherReason,
      description: body.description,
      signature: body.signature
    }
  });

  // gerar pdf e enviar para o próprio técnico e para o responsável? por enquanto só gera e retorna ok
  const html = buildJustificationHTML({
    user: session.user.name || session.user.email,
    role: session.user.role,
    checklistType: body.checklistType,
    expectedDate: body.expectedDate,
    filledDate: body.filledDate,
    expectedTime: body.expectedTime,
    filledTime: body.filledTime,
    reason: body.reason,
    otherReason: body.otherReason,
    description: body.description,
    signature: body.signature,
    createdAt: new Date().toLocaleString("pt-BR")
  });

  const pdf = await generateChecklistPDFBuffer(html);

  // respond with created justification id and pdf (base64) so client can continue
  return Response.json({ ok: true, id: justification.id, pdf: Buffer.from(pdf).toString("base64") });
}
