import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendChecklistEmail(to: string, pdf: Buffer) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Checklist preenchido",
    text: "Segue checklist em anexo",
    attachments: [
      {
        filename: "checklist.pdf",
        content: pdf
      }
    ]
  });
}