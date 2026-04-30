import { prisma } from "@/lib/prisma";
import { generateChecklistPDFBuffer } from "@/lib/pdf";
import { buildChecklistHTML } from "@/lib/pdf";
import { sendChecklistEmail } from "@/lib/mail";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  console.log("Starting checklist submission");

  try {
    const session = await getServerSession(authOptions);
    console.log("Session retrieved:", session ? "exists" : "null");

    if (!session || !session.user?.id) {
      console.error("Unauthorized: no session or user id");
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log("Request body parsed");

    console.log("Creating checklist in DB");
    const checklist = await prisma.checklist.create({
      data: {
        userId: session.user.id,
        templateId: body.templateId
      }
    });
    console.log("Checklist created with id:", checklist.id);

    const answersArray = Object.entries(body.answers).map(
      ([questionId, value]: any) => ({
        checklistId: checklist.id,
        questionId,
        answer: JSON.stringify(value)
      })
    );
    console.log("Prepared answers array, length:", answersArray.length);

    await prisma.checklistAnswer.createMany({ data: answersArray });
    console.log("Answers saved to DB");

    await prisma.signature.create({
      data: {
        checklistId: checklist.id,
        image: body.signature
      }
    });
    console.log("Signature saved to DB");

    const questions = await prisma.checklistQuestion.findMany({
      where: { templateId: body.templateId }
    });
    console.log("Questions fetched, count:", questions.length);

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
    console.log("Items prepared for HTML");

    const html = buildChecklistHTML({
      user: session.user.name,
      date: new Date().toLocaleString("pt-BR"),
      type: "Checklist Técnico",
      signature: body.signature,
      items
    });
    console.log("HTML built");

    console.log("Starting PDF generation");
    const pdf = await generateChecklistPDFBuffer(html);
    console.log("PDF generated, size:", pdf.length);

    console.log("Sending email");
    await sendChecklistEmail(
      process.env.EMAIL_USER!,
      Buffer.from(pdf)
    );
    console.log("Email sent successfully");

    return Response.json({ ok: true });

  } catch (error) {
    console.error("Error in checklist submission:", error);
    return new Response("Erro interno", { status: 500 });
  }
}