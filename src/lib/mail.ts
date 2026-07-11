import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendChecklistEmail(
  to: string,
  attachments: { filename: string; content: Buffer }[],
  subject: string
) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text: "Segue documentos em anexo",
    attachments
  });
}