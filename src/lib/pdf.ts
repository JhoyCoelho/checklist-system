import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";
import fs from "fs";
import path from "path";

function getLogoBase64() {
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'img', 'logo.png'),
    path.join(process.cwd(), 'src', 'img', 'logo.png')
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      const image = fs.readFileSync(filePath);
      return 'data:image/png;base64,' + image.toString('base64');
    }
  }

  return '';
}

export function buildChecklistHTML(data: any) {
  const normalizedStatus = (status: string) => status?.toString().trim().toUpperCase();

  const statusColor = (status: string) => {
    const normalized = normalizedStatus(status);
    if (normalized === "OK" || normalized === "SIM") return "#16a34a";
    if (normalized === "FALTANDO") return "#f59e0b";
    if (normalized === "DANIFICADO" || normalized === "NÃO" || normalized === "NAO") return "#dc2626";
    return "#6b7280";
  };

  const statusLabel = (status: string) => {
    const normalized = normalizedStatus(status);
    if (normalized === "OK") return "OK";
    if (normalized === "SIM") return "SIM";
    if (normalized === "NÃO" || normalized === "NAO") return "NÃO";
    if (normalized === "FALTANDO") return "FALTANDO";
    if (normalized === "DANIFICADO") return "DANIFICADO";
    return status || "-";
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

export function buildJustificationHTML(data: any) {
  const logo = getLogoBase64();

  return `
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @page { size: A4; margin: 18mm 15mm; }
        body { font-family: Arial, sans-serif; color: #1f2937; margin: 0; padding: 0; }
        .page { padding: 18px; box-sizing: border-box; }

        .header { display:flex; align-items:center; gap:12px; border-bottom:4px solid #1e40af; padding-bottom:10px; margin-bottom:18px; }
        .logo { height:48px; }
        .header-center { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .title { font-size:20px; font-weight:700; color:#1e3a8a; text-align:center }

        .meta { display:flex; gap:12px; font-size:12px; color:#334155; }

        .info-grid { display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:14px; }
        .card { background:#f8fafc; padding:10px; border-radius:6px; font-size:13px; }

        .section { margin-top:12px; font-size:13px; }
        .label { font-weight:700; color:#0f172a; }

        .description { background:#fff; border:1px solid #e6eef8; padding:10px; border-radius:6px; min-height:60px; }

        .signatures { display:flex; gap:30px; margin-top:22px; align-items:flex-start; }
        .sign-block { width:45%; }
        .sign-label { font-weight:700; margin-bottom:6px; }
        .signature-box { border-top:1px solid #cbd5e1; padding-top:8px; height:90px; }

        .footer { margin-top:18px; font-size:11px; color:#64748b; }

        /* keep signature and nearby content together on one page */
        .no-break { page-break-inside: avoid; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <img src="${logo}" class="logo" />
          <div class="header-center">
            <div class="title">REGISTRO DE JUSTIFICATIVA DE PREENCHIMENTO FORA DO PRAZO</div>
            <div class="meta">Documento gerado: ${data.createdAt}</div>
          </div>
        </div>

        <div class="info-grid">
          <div class="card"><span class="label">Colaborador:</span> ${data.user}</div>
          <div class="card"><span class="label">Cargo:</span> ${data.role}</div>
          <div class="card"><span class="label">Checklist:</span> ${data.checklistType}</div>
          <div class="card"><span class="label">Motivo:</span> ${data.reason} ${data.otherReason ? ` - ${data.otherReason}` : ''}</div>
        </div>

        <div class="section">
          <div style="display:flex; gap:12px">
            <div class="card" style="flex:1"><span class="label">Data não preenchido:</span><br/>${data.expectedDate || '-'} ${data.expectedTime ? ' - ' + data.expectedTime : ''}</div>
            <div class="card" style="flex:1"><span class="label">Data do preenchimento (atraso):</span><br/>${data.filledDate || '-'} ${data.filledTime ? ' - ' + data.filledTime : ''}</div>
          </div>
        </div>

        <div class="section">
          <div class="label">Descrição:</div>
          <div class="description">${data.description || '-'}</div>
        </div>

        <div class="section no-break">
          <div>Declaro que esta justificativa tem apenas a finalidade de registrar formalmente o motivo do preenchimento fora do prazo, não substituindo o checklist.</div>

          <div class="signatures">
            <div class="sign-block">
              <div class="sign-label">Assinatura do colaborador</div>
              <div class="signature-box">
                ${data.signature ? `<img src="${data.signature}" style="max-height:86px; width:auto;"/>` : ''}
              </div>
            </div>

            <div class="sign-block">
              <div class="sign-label">Assinatura do Responsável</div>
              <div class="signature-box">
                ${data.adminSignature ? `<img src="${data.adminSignature}" style="max-height:86px; width:auto;"/>` : ''}
              </div>
              ${data.adminName ? `<div style="margin-top:8px; font-size:12px; color:#334155;">${data.adminName}</div>` : ''}
            </div>
          </div>
        </div>

        <div class="footer">Documento gerado automaticamente pelo sistema Fyberlink</div>
      </div>
    </body>
  </html>
  `;
}