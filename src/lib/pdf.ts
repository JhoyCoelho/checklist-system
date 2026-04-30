import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import fs from "fs";
import path from "path";

function getLogoBase64() {
  // Hardcoded base64 for production compatibility
  return "data:image/png;base64,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";
}"src/img/logo.png");
  const image = fs.readFileSync(filePath);
  return `data:image/png;base64,${image.toString("base64")}`;
}

export function buildChecklistHTML(data: any) {
  const statusColor = (status: string) => {
    if (status === "OK") return "#16a34a";
    if (status === "FALTANDO") return "#f59e0b";
    if (status === "DANIFICADO") return "#dc2626";
    return "#6b7280";
  };

  const statusLabel = (status: string) => {
    if (status === "OK") return "OK";
    if (status === "FALTANDO") return "FALTANDO";
    if (status === "DANIFICADO") return "DANIFICADO";
    return status;
  };

  return `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #1f2937;
        }

        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 3px solid #4f46e5;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }

        .logo {
          height: 50px;
        }

        .title {
          font-size: 22px;
          font-weight: bold;
          color: #1e3a8a;
        }

        .info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 14px;
          gap: 10px;
        }

        .card {
          background: #f9fafb;
          padding: 10px;
          border-radius: 8px;
          width: 100%;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        th {
          background: #1e3a8a;
          color: white;
          padding: 10px;
          text-align: left;
        }

        td {
          padding: 10px;
          border-bottom: 1px solid #e5e7eb;
        }

        .status {
          font-weight: bold;
          color: white;
          padding: 4px 8px;
          border-radius: 6px;
          display: inline-block;
        }

        .footer {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .signature {
          margin-top: 10px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
          width: 200px;
        }

        .signature img {
          width: 100%;
        }

        .meta {
          font-size: 12px;
          color: #6b7280;
          margin-top: 20px;
        }

      </style>
    </head>

    <body>

      <!-- HEADER -->
      <div class="header">
        <img src="${getLogoBase64()}" class="logo"/>
        <div class="title">CHECKLIST TÉCNICO</div>
      </div>

      <!-- INFO -->
      <div class="info">
        <div class="card">
          <strong>Técnico:</strong> ${data.user}<br/>
          <strong>Data:</strong> ${data.date}
        </div>

        <div class="card">
          <strong>Tipo:</strong> ${data.type}<br/>
          <strong>Destino:</strong> Gestão / Supervisão
        </div>
      </div>

      <!-- TABELA -->
      <table>
        <thead>
          <tr>
            <th style="width:50%">Item</th>
            <th style="width:20%">Status</th>
            <th style="width:30%">Observação</th>
          </tr>
        </thead>

        <tbody>
          ${data.items
            .map(
              (item: any, index: number) => `
              <tr>
                <td>${index + 1} - ${item.question}</td>
                <td>
                  <span class="status" style="background:${statusColor(item.status)}">
                    ${statusLabel(item.status)}
                  </span>
                </td>
                <td>${item.observation || "-"}</td>
              </tr>
            `
            )
            .join("")}
        </tbody>
      </table>

      <!-- FOOTER -->
      <div class="footer">
        <div>
          <strong>Assinatura do Técnico</strong>
          <div class="signature">
            <img src="${data.signature}" />
          </div>
        </div>
      </div>

      <div class="meta">
        Documento gerado automaticamente pelo sistema Fyberlink
      </div>

    </body>
  </html>
  `;
}

// 🔥 GERAÇÃO DO PDF
// 🔥 GERAÇÃO DO PDF (COMPATÍVEL COM VERCEL)
export async function generateChecklistPDFBuffer(html: string) {
  const isDev = process.env.NODE_ENV !== "production";

  const browser = await puppeteer.launch({
    args: isDev
      ? []
      : chromium.args,
    executablePath: isDev
      ? undefined // usa chrome local
      : await chromium.executablePath(),
    headless: true
  });

  const page = await browser.newPage();

  await page.setContent(html, {
    waitUntil: "networkidle0"
  });

  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20px",
      right: "20px",
      bottom: "20px",
      left: "20px"
    }
  });

  await browser.close();

  return pdf;
}