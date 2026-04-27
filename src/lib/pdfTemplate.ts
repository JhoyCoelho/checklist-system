export function generateChecklistHTML(data: any) {
  return `
    <h1 style="text-align:center;">Checklist Técnico</h1>

    <p><b>Técnico:</b> ${data.user}</p>
    <p><b>Data:</b> ${new Date().toLocaleString()}</p>

    <hr/>

    ${data.answers.map((a: any) => `
      <div style="margin-bottom:10px;">
        <b>${a.question}</b><br/>
        Status: ${a.status}<br/>
        ${a.observation ? `Obs: ${a.observation}` : ""}
      </div>
    `).join("")}

    <hr/>

    <p><b>Assinatura:</b></p>
    <img src="${data.signature}" width="200"/>
  `;
}