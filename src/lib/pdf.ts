import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

function getLogoBase64() {
  const filePath = path.join(process.cwd(), "src/img/logo.png");
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
export async function generateChecklistPDFBuffer(html: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
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