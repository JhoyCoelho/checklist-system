"use client";

import { useEffect, useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function ChecklistPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  type AnswerType = {
    status?: string;
    observation?: string;
    text?: string;
  };

  const [answers, setAnswers] = useState<Record<string, AnswerType>>({});
  const sigRef = useRef<any>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then(res => res.json())
      .then(setTemplates);
  }, []);

  function setAnswer(questionId: string, data: Partial<AnswerType>) {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...data
      }
    }));
  }

  function validate() {
    if (!selectedTemplate) return false;

    for (const q of selectedTemplate.questions) {
      const ans = answers[q.id];

      if (q.type === "TEXT") {
        if (!ans?.text) {
          alert("Preencha todos os campos!");
          return false;
        }
      } else {
        if (!ans?.status) {
          alert("Preencha todos os itens!");
          return false;
        }
      }
    }

    if (!sigRef.current || sigRef.current.isEmpty()) {
      alert("Assinatura obrigatória!");
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;

    const signature = sigRef.current
      ?.getTrimmedCanvas()
      .toDataURL("image/png");

    const res = await fetch("/api/checklist", {
      method: "POST",
      body: JSON.stringify({
        templateId: selectedTemplate.id,
        answers,
        signature
      })
    });

    if (res.ok) {
      alert("Checklist enviado com sucesso!");
      setAnswers({});
      sigRef.current?.clear();
      setSelectedTemplate(null);
    } else {
      alert("Erro ao enviar");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      <div className="bg-blue-600 text-white p-4 text-center text-xl font-bold shadow">
        Checklist Técnico
      </div>

      <div className="flex-1 p-4 max-w-xl w-full mx-auto">

        {!selectedTemplate && (
          <div className="flex flex-col gap-3">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                className="bg-white border p-4 rounded-xl shadow text-left"
              >
                <p className="font-semibold">{t.name}</p>
              </button>
            ))}
          </div>
        )}

        {selectedTemplate && (
          <div className="flex flex-col gap-4">

            <h2 className="text-lg font-bold">
              {selectedTemplate.name}
            </h2>

            {selectedTemplate.questions.map((q: any) => (
              <div key={q.id} className="bg-white p-4 rounded-xl shadow">

                <p className="font-medium mb-2">{q.question}</p>

                {/* STATUS (Ferramentas) */}
                {q.type === "STATUS" && (
                  <>
                    <div className="flex gap-2 mb-2">
                      {["OK", "FALTANDO", "DANIFICADO"].map(status => (
                        <button
                          key={status}
                          onClick={() => setAnswer(q.id, { status })}
                          className={`px-3 py-1 rounded text-white ${
                            answers[q.id]?.status === status
                              ? status === "OK"
                                ? "bg-green-600"
                                : status === "FALTANDO"
                                ? "bg-yellow-500"
                                : "bg-red-600"
                              : "bg-gray-300 text-gray-700"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    {answers[q.id]?.status !== "OK" && (
                      <textarea
                        placeholder="Observação"
                        className="w-full border p-2 rounded"
                        value={answers[q.id]?.observation || ""}
                        onChange={e =>
                          setAnswer(q.id, { observation: e.target.value })
                        }
                      />
                    )}
                  </>
                )}

                {/* YES / NO (Veículo) */}
                {q.type === "YES_NO" && (
                  <>
                    <div className="flex gap-2 mb-2">
                      {["SIM", "NÃO"].map(status => (
                        <button
                          key={status}
                          onClick={() => setAnswer(q.id, { status })}
                          className={`px-3 py-1 rounded text-white ${
                            answers[q.id]?.status === status
                              ? status === "SIM"
                                ? "bg-green-600"
                                : "bg-red-600"
                              : "bg-gray-300 text-gray-700"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    {answers[q.id]?.status === "NÃO" && (
                      <textarea
                        placeholder="Descreva o problema..."
                        className="w-full border p-2 rounded"
                        value={answers[q.id]?.observation || ""}
                        onChange={e =>
                          setAnswer(q.id, { observation: e.target.value })
                        }
                      />
                    )}
                  </>
                )}

                {/* TEXTO LIVRE */}
                {q.type === "TEXT" && (
                  <textarea
                    placeholder="Digite sua resposta..."
                    className="w-full border p-2 rounded"
                    value={answers[q.id]?.text || ""}
                    onChange={e =>
                      setAnswer(q.id, { text: e.target.value })
                    }
                  />
                )}

              </div>
            ))}

            {/* ASSINATURA */}
            <div className="bg-white p-4 rounded-xl shadow">
              <p>Assinatura</p>

              <SignatureCanvas
                ref={sigRef}
                canvasProps={{ className: "w-full h-40 border" }}
              />

              <button
                onClick={() => sigRef.current?.clear()}
                className="mt-2 text-red-500 text-sm"
              >
                Limpar assinatura
              </button>
            </div>

            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white p-3 rounded"
            >
              Enviar
            </button>

          </div>
        )}
      </div>
    </div>
  );
}