"use client";

import { useState } from "react";

export default function ChecklistPage() {
  const [answers, setAnswers] = useState<any>({});
  const [signature, setSignature] = useState("");

  async function handleSubmit() {
    const res = await fetch("/api/checklist", {
      method: "POST",
      body: JSON.stringify({
        templateId: "56618579-b0bf-4fcb-a274-4acc277387e9",
        answers,
        signature
      })
    });

    if (res.ok) {
      alert("Checklist enviado!");
    } else {
      alert("Erro");
    }
  }

  return (
    <div className="p-10 flex flex-col gap-4">
      <h1>Checklist</h1>

      <label>
        <input
          type="checkbox"
          onChange={e =>
            setAnswers({ ...answers, alicate: e.target.checked })
          }
        />
        Alicate presente
      </label>

      <label>
        <input
          type="checkbox"
          onChange={e =>
            setAnswers({ ...answers, chave: e.target.checked })
          }
        />
        Chave presente
      </label>

      <textarea
        placeholder="Observações"
        onChange={e =>
          setAnswers({ ...answers, obs: e.target.value })
        }
      />

      <input
        placeholder="Assinatura (digite seu nome)"
        onChange={e => setSignature(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="bg-black text-white p-2"
      >
        Enviar
      </button>
    </div>
  );
}