"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SignatureCanvas from "react-signature-canvas";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatTime(date: Date) {
  return date.toTimeString().slice(0, 5);
}

export default function JustificationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [templates, setTemplates] = useState<any[]>([]);
  const [form, setForm] = useState({
    templateId: "",
    checklistType: "",
    expectedDate: "",
    expectedTime: "",
    filledDate: "",
    filledTime: "",
    reason: "",
    otherReason: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const sigRef = useRef<any>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/templates")
      .then(res => res.json())
      .then((data: any[]) => setTemplates(data));
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const now = new Date();
    setForm(prev => ({
      ...prev,
      expectedDate: prev.expectedDate || formatDate(now),
      expectedTime: prev.expectedTime || formatTime(now),
      filledDate: prev.filledDate || formatDate(now),
      filledTime: prev.filledTime || formatTime(now)
    }));
  }, [status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  function updateField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleTemplateChange(templateId: string) {
    const template = templates.find(t => t.id === templateId);
    updateField("templateId", templateId);
    updateField("checklistType", template?.name || "");
  }

  function validate() {
    if (!form.templateId) {
      setMessage("Selecione o checklist que será preenchido.");
      setMessageType("error");
      return false;
    }

    if (!form.expectedDate || !form.expectedTime || !form.filledDate || !form.filledTime) {
      setMessage("Preencha data e hora prevista e do preenchimento.");
      setMessageType("error");
      return false;
    }

    if (!form.reason) {
      setMessage("Selecione um motivo para a justificativa.");
      setMessageType("error");
      return false;
    }

    const sig = sigRef.current;
    if (!sig || sig.isEmpty()) {
      setMessage("Assinatura obrigatória para enviar a justificativa.");
      setMessageType("error");
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    if (!validate()) return;

    const signature = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
    setIsSubmitting(true);
    setMessage("Enviando justificativa...");
    setMessageType("info");

    try {
      const res = await fetch("/api/justification", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          signature
        })
      });

      const json = await res.json();
      if (!res.ok) {
        setMessage(json?.message || "Erro ao enviar justificativa.");
        setMessageType("error");
        setIsSubmitting(false);
        return;
      }

      setMessage("Justificativa enviada com sucesso!");
      setMessageType("success");
      setShowSuccess(true);

      setTimeout(() => {
        router.push(`/checklist?templateId=${encodeURIComponent(form.templateId)}&justificationId=${encodeURIComponent(json.id || "")}`);
      }, 900);
    } catch (error) {
      console.error(error);
      setMessage("Erro ao enviar justificativa.");
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

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-blue-600 text-white p-4 text-center text-xl font-bold shadow">
        Justificativa de Preenchimento em Atraso
      </div>

      <div className="flex-1 p-4 max-w-2xl w-full mx-auto">
        <div className="bg-white rounded-3xl p-6 shadow-xl ring-1 ring-gray-200">
          <div className="mb-6 space-y-2">
            <h1 className="text-2xl font-semibold">Registro de justificativa</h1>
            <p className="text-sm text-gray-600">
              Escolha o checklist que será preenchido, informe data e hora, e envie a justificativa diretamente para abertura do checklist.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Checklist a ser preenchido</label>
              <select
                className="w-full border rounded-xl p-3 bg-white"
                value={form.templateId}
                onChange={e => handleTemplateChange(e.target.value)}
              >
                <option value="">Selecione o checklist</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>{template.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Data prevista</label>
                <input
                  type="date"
                  className="w-full border rounded-xl p-3"
                  value={form.expectedDate}
                  onChange={e => updateField("expectedDate", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Hora prevista</label>
                <input
                  type="time"
                  className="w-full border rounded-xl p-3"
                  value={form.expectedTime}
                  onChange={e => updateField("expectedTime", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Data do preenchimento</label>
                <input
                  type="date"
                  className="w-full border rounded-xl p-3"
                  value={form.filledDate}
                  onChange={e => updateField("filledDate", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Hora do preenchimento</label>
                <input
                  type="time"
                  className="w-full border rounded-xl p-3"
                  value={form.filledTime}
                  onChange={e => updateField("filledTime", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Motivo</label>
              <select
                className="w-full border rounded-xl p-3"
                value={form.reason}
                onChange={e => updateField("reason", e.target.value)}
              >
                <option value="">Selecione o motivo</option>
                <option value="Esquecimento">Esquecimento</option>
                <option value="Problema no sistema">Problema no sistema</option>
                <option value="Atendimento">Atendimento</option>
                <option value="Falta de tempo">Falta de tempo</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            {form.reason === "Outro" && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Outro motivo</label>
                <input
                  type="text"
                  className="w-full border rounded-xl p-3"
                  placeholder="Explique o motivo"
                  value={form.otherReason}
                  onChange={e => updateField("otherReason", e.target.value)}
                />
              </div>
            )}

            <div className="grid gap-2">
              <label className="text-sm font-medium">Descrição</label>
              <textarea
                rows={4}
                className="w-full border rounded-xl p-3"
                placeholder="Descreva brevemente o motivo e contexto do atraso"
                value={form.description}
                onChange={e => updateField("description", e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Assinatura do colaborador</label>
              <div className="border rounded-xl overflow-hidden">
                <SignatureCanvas
                  ref={sigRef}
                  clearOnResize={false}
                  onBegin={() => {
                    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
                      document.activeElement.blur();
                    }
                  }}
                  canvasProps={{
                    className: "w-full h-48",
                    style: { touchAction: 'none', userSelect: 'none' }
                  }}
                />
              </div>
              <button
                type="button"
                className="text-sm text-red-500 hover:underline text-left"
                onClick={() => sigRef.current?.clear()}
              >
                Limpar assinatura
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => router.push("/checklist")}
                className="text-gray-700 underline"
                type="button"
              >
                Voltar ao checklist
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`rounded-xl px-5 py-3 text-white ${isSubmitting ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {isSubmitting ? "Enviando..." : "Enviar justificativa"}
              </button>
            </div>

            {message && (
              <div className={`rounded-xl border p-4 ${messageType === "success" ? "border-green-200 bg-green-50 text-green-800" : messageType === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-blue-200 bg-blue-50 text-blue-800"}`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-full shadow-lg">
            <span className="text-6xl">✅</span>
          </div>
        </div>
      )}
    </div>
  );
}
