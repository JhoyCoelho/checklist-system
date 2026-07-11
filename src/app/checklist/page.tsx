"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import SignatureCanvas from "react-signature-canvas";

function ChecklistContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [justificationId, setJustificationId] = useState<string | null>(null);
  const [adminPendingCount, setAdminPendingCount] = useState<number | null>(null);

  type AnswerType = {
    status?: string;
    observation?: string;
    text?: string;
  };

  const [answers, setAnswers] = useState<Record<string, AnswerType>>({});
  const sigRef = useRef<any>(null);

  const orderedQuestions = selectedTemplate
    ? [
        ...selectedTemplate.questions.filter((q: any) => q.type !== "TEXT"),
        ...selectedTemplate.questions.filter((q: any) => q.type === "TEXT")
      ]
    : [];

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/templates")
      .then(res => res.json())
      .then(setTemplates);
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "ADMIN") return;

    fetch("/api/admin/pending")
      .then(res => res.json())
      .then(json => {
        if (json.ok) {
          setAdminPendingCount(Array.isArray(json.pending) ? json.pending.length : 0);
        } else {
          setAdminPendingCount(0);
        }
      })
      .catch(() => setAdminPendingCount(0));
  }, [status, session]);

  useEffect(() => {
    if (!templates.length) return;

    const templateId = searchParams.get("templateId");
    const justificationIdParam = searchParams.get("justificationId");

    if (templateId) {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
      }
    }

    if (justificationIdParam) {
      setJustificationId(justificationIdParam);
    }
  }, [templates, searchParams]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

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
    setMessage("");
    setMessageType("info");

    if (!validate()) return;

    const signature = sigRef.current
      ?.getTrimmedCanvas()
      .toDataURL("image/png");

    setIsSubmitting(true);
    setMessage("Enviando checklist...");
    setMessageType("info");

    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          answers,
          signature,
          justificationId
        })
      });

      const json = await res.json();

      if (res.ok) {
        if (json.pending) {
          setMessage("Checklist enviado. Aguardando aprovação do responsável ✅");
        } else {
          setMessage("Checklist enviado com sucesso!");
        }
        setMessageType("success");
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          setAnswers({});
          sigRef.current?.clear();
          setSelectedTemplate(null);
          setIsSubmitting(false);
          setJustificationId(null);
        }, 1200);
      } else if (res.status === 401) {
        setMessage("Sessão inválida ou expirada. Faça login novamente.");
        setMessageType("error");
        setIsSubmitting(false);
      } else {
        setMessage("Erro ao enviar checklist. Tente novamente mais tarde.");
        setMessageType("error");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Erro no envio do checklist:", error);
      setMessage("Erro ao enviar checklist. Verifique a conexão e tente novamente.");
      setMessageType("error");
      setIsSubmitting(false);
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md bg-white p-6 rounded-xl shadow text-center">
          <h1 className="text-xl font-bold mb-4">Acesso inválido</h1>
          <p className="mb-4">
            Você precisa fazer login para preencher o checklist.
          </p>
          <a
            href="/login"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Ir para login
          </a>
        </div>
      </div>
    );
  }

  const allowedRoles = ["ADMIN", "TECHNICIAN"];

  if (
    status === "authenticated" &&
    !allowedRoles.includes(session?.user?.role || "")
  ) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="max-w-md bg-white p-6 rounded-xl shadow text-center">
          <h1 className="text-xl font-bold mb-4">Acesso negado</h1>
          <p>
            Seu usuário não tem permissão para acessar esta área.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-blue-600 text-white p-4 text-center text-xl font-bold shadow">
        Checklist Técnico
      </div>

      <div className="flex-1 p-4 max-w-xl w-full mx-auto">
        {!selectedTemplate && (
          <div className="flex flex-col gap-3">
            {session?.user?.role === "ADMIN" && (
              <div className="bg-white border border-gray-200 rounded-3xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Solicitações pendentes</p>
                    <p className="text-3xl font-semibold">
                      {adminPendingCount === null ? "..." : adminPendingCount}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push('/admin/pending')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                  >
                    Ver solicitações
                  </button>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Aqui ficam as justificativas e checklists em atraso aguardando assinatura do responsável.
                </p>
              </div>
            )}

            <button
              onClick={() => router.push('/checklist/justification')}
              className="bg-yellow-500 text-white p-3 rounded-xl shadow text-left"
            >
              Preenchimento em atraso / Justificativa
            </button>

            {templates.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                Carregando checklists disponíveis...
              </div>
            ) : (
              templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t)}
                  className="bg-white border p-4 rounded-xl shadow text-left hover:border-blue-500"
                >
                  <p className="font-semibold text-lg">{t.name}</p>
                  <p className="text-sm text-gray-500">Clique para iniciar o checklist</p>
                </button>
              ))
            )}
          </div>
        )}

        {selectedTemplate && (
          <div className="flex flex-col gap-4">
            {showSuccess && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white p-6 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-6xl">✅</span>
                </div>
              </div>
            )}

            {justificationId && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
                Justificativa registrada com sucesso. Checklist pré-selecionado para preenchimento.
              </div>
            )}

            <h2 className="text-lg font-bold">{selectedTemplate.name}</h2>

            {orderedQuestions.map((q: any) => (
              <div key={q.id} className="bg-white p-4 rounded-xl shadow">
                <p className="font-medium mb-2">{q.question}</p>

                {q.type === "STATUS" && (
                  <>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {['OK', 'FALTANDO', 'DANIFICADO'].map(status => (
                        <button
                          key={status}
                          onClick={() => setAnswer(q.id, { status })}
                          className={`px-3 py-1 rounded text-white ${
                            answers[q.id]?.status === status
                              ? status === 'OK'
                                ? 'bg-green-600'
                                : status === 'FALTANDO'
                                ? 'bg-yellow-500'
                                : 'bg-red-600'
                              : 'bg-gray-300 text-gray-700'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    {answers[q.id]?.status !== 'OK' && (
                      <textarea
                        placeholder="Observação"
                        className="w-full border p-2 rounded"
                        value={answers[q.id]?.observation || ""}
                        onChange={e => setAnswer(q.id, { observation: e.target.value })}
                      />
                    )}
                  </>
                )}

                {q.type === "YES_NO" && (
                  <>
                    <div className="flex gap-2 mb-2">
                      {['SIM', 'NÃO'].map(status => (
                        <button
                          key={status}
                          onClick={() => setAnswer(q.id, { status })}
                          className={`px-3 py-1 rounded text-white ${
                            answers[q.id]?.status === status
                              ? status === 'SIM'
                                ? 'bg-green-600'
                                : 'bg-red-600'
                              : 'bg-gray-300 text-gray-700'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    {answers[q.id]?.status === 'NÃO' && (
                      <textarea
                        placeholder="Descreva o problema..."
                        className="w-full border p-2 rounded"
                        value={answers[q.id]?.observation || ""}
                        onChange={e => setAnswer(q.id, { observation: e.target.value })}
                      />
                    )}
                  </>
                )}

                {q.type === "TEXT" && (
                  <textarea
                    placeholder="Digite sua resposta..."
                    className="w-full border p-2 rounded"
                    value={answers[q.id]?.text || ""}
                    onChange={e => setAnswer(q.id, { text: e.target.value })}
                  />
                )}
              </div>
            ))}

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="font-medium mb-2">Assinatura</p>

              <SignatureCanvas
                ref={sigRef}
                clearOnResize={false}
                onBegin={() => {
                  if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }
                }}
                canvasProps={{
                  className: "w-full h-40 border rounded",
                  style: { touchAction: 'none', userSelect: 'none' }
                }}
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
              disabled={isSubmitting}
              className={`bg-blue-600 text-white p-3 rounded transition ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"}`}
            >
              {isSubmitting ? "Enviando..." : "Enviar"}
            </button>

            {message && (
              <div
                className={`mt-4 rounded-lg border p-3 ${
                  messageType === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : messageType === "error"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-blue-200 bg-blue-50 text-blue-800"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChecklistPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>Carregando...</p></div>}>
      <ChecklistContent />
    </Suspense>
  );
}