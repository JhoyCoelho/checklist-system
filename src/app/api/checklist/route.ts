import { prisma } from "@/lib/prisma";
import { generateChecklistPDFBuffer } from "@/lib/pdf";
import { sendChecklistEmail } from "@/lib/mail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 🔒 valida autenticação
    if (!session || !session.user?.id) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401
      });
    }

    const body = await req.json();

    const { templateId, answers, signature } = body;

    // 📝 cria checklist
    const checklist = await prisma.checklist.create({
      data: {
        userId: session.user.id,
        templateId
      }
    });

    // 💾 salva respostas
    const answersFormatted = Object.entries(answers).map(
      ([questionId, value]) => ({
        checklistId: checklist.id,
        questionId,
        answer: String(value)
      })
    );

    await prisma.checklistAnswer.createMany({
      data: answersFormatted
    });

    // ✍️ salva assinatura
    await prisma.signature.create({
      data: {
        checklistId: checklist.id,
        image: signature
      }
    });

    // 🧾 montar HTML do PDF (simples por enquanto)
    const html = `
      <h1>Checklist</h1>
      <p><strong>ID:</strong> ${checklist.id}</p>
      <p><strong>Data:</strong> ${new Date().toLocaleString()}</p>

      <h2>Respostas</h2>
      ${answersFormatted
        .map(a => `<p><strong>${a.questionId}:</strong> ${a.answer}</p>`)
        .join("")}

      <h2>Assinatura</h2>
      <img src="${signature}" width="200"/>
    `;

    // 📄 gerar PDF em memória
    const pdfBuffer = await generateChecklistPDFBuffer(html);

    // 📧 enviar e-mail
    await sendChecklistEmail(
      "admin@email.com", // ⚠️ depois podemos dinamizar isso
      pdfBuffer
    );

    // ✅ marcar como concluído
    await prisma.checklist.update({
      where: { id: checklist.id },
      data: { status: "COMPLETED" }
    });

    return Response.json({ success: true });

  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({ error: "Erro ao processar checklist" }),
      { status: 500 }
    );
  }
}