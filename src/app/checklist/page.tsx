"use client";

import { useEffect, useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function ChecklistPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [answers, setAnswers] = useState<any>({});

  const sigRef = useRef<any>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then(res => res.json())
      .then(setTemplates);
  }, []);

  function validate() {
    if (!selectedTemplate) return false;

    for (const q of selectedTemplate.questions) {
      if (q.type === "CHECKBOX" && answers[q.id] === undefined) {
        alert("Preencha todos os itens!");
        return false;
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
      sigRef.current.clear();
      setSelectedTemplate(null);
    } else {
      alert("Erro ao enviar");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* HEADER */}
      <div className="bg-blue-600 text-white p-4 text-center text-xl font-bold shadow">
        Checklist Técnico
      </div>

      <div className="flex-1 p-4 max-w-xl w-full mx-auto">

        {/* LISTA DE CHECKLISTS */}
        {!selectedTemplate && (
          <div className="flex flex-col gap-3">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                className="bg-white border border-gray-200 p-4 rounded-xl text-left shadow-sm hover:shadow-md transition"
              >
                <p className="font-semibold text-gray-800 text-lg">
                  {t.name}
                </p>
                <p className="text-sm text-gray-500">
                  Toque para iniciar
                </p>
              </button>
            ))}
          </div>
        )}

        {/* CHECKLIST */}
        {selectedTemplate && (
          <div className="flex flex-col gap-4">

            {/* TÍTULO */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h2 className="text-lg font-bold text-gray-800">
                {selectedTemplate.name}
              </h2>
            </div>

            {/* QUESTÕES */}
            <div className="flex flex-col gap-3">
              {selectedTemplate.questions.map((q: any) => (
                <div
                  key={q.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-200"
                >

                  {q.type === "CHECKBOX" && (
                    <label className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        className="w-6 h-6 accent-blue-600"
                        onChange={e =>
                          setAnswers({
                            ...answers,
                            [q.id]: e.target.checked
                          })
                        }
                      />
                      <span className="text-gray-800 text-base font-medium">
                        {q.question}
                      </span>
                    </label>
                  )}

                  {q.type === "TEXT" && (
                    <div>
                      <p className="mb-2 text-gray-700 font-medium">
                        {q.question}
                      </p>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        onChange={e =>
                          setAnswers({
                            ...answers,
                            [q.id]: e.target.value
                          })
                        }
                      />
                    </div>
                  )}

                </div>
              ))}
            </div>

            {/* ASSINATURA */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <p className="font-semibold text-gray-800 mb-2">
                Assinatura do técnico
              </p>

              <div className="border rounded-lg overflow-hidden bg-white">
                <SignatureCanvas
                  penColor="black"
                  canvasProps={{
                    className: "w-full h-40"
                  }}
                  ref={sigRef}
                />
              </div>

              <button
                onClick={() => sigRef.current.clear()}
                className="text-sm text-red-500 mt-2"
              >
                Limpar assinatura
              </button>
            </div>

            {/* BOTÕES */}
            <div className="flex gap-3 mt-2">

              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white p-4 rounded-xl text-lg font-semibold shadow hover:bg-blue-700 transition"
              >
                Enviar
              </button>

              <button
                onClick={() => setSelectedTemplate(null)}
                className="flex-1 bg-gray-200 text-gray-700 p-4 rounded-xl text-lg font-semibold"
              >
                Voltar
              </button>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}