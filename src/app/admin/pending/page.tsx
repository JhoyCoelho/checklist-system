"use client";

import { useEffect, useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function AdminPendingPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const sigRef = useRef<any>(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");

  useEffect(() => {
    fetch('/api/admin/pending').then(res => res.json()).then(json => {
      if (json.ok) setPending(json.pending || []);
      setLoading(false);
    }).catch(err => { console.error(err); setLoading(false); });
  }, []);

  async function handleApprove(item: any) {
    const sig = sigRef.current?.getTrimmedCanvas().toDataURL('image/png');
    if (!sig) {
      alert('Assinatura é obrigatória para aprovação');
      return;
    }

    try {
      const res = await fetch('/api/admin/approve', {
        method: 'POST',
        body: JSON.stringify({ checklistId: item.checklistId || item.checklist?.id, image: sig })
      });

      if (res.ok) {
        setMessage('Aprovado com sucesso ✅');
        setMessageType('success');
        setPending(p => p.filter(p => p.id !== item.id));
        setSelected(null);
      } else {
        setMessage('Erro ao aprovar');
        setMessageType('error');
      }
    } catch (err) {
      console.error(err);
      setMessage('Erro ao aprovar');
      setMessageType('error');
    }
  }

  if (loading) return <div className="p-6">Carregando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Pendências para confirmação</h1>

      {pending.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-blue-200 bg-blue-50 p-6 text-center shadow-sm">
          <p className="text-2xl font-semibold text-blue-700">Nenhuma pendência no momento</p>
          <p className="mt-2 text-sm text-blue-600 max-w-xl mx-auto">
            Todas as justificativas pendentes já foram aprovadas ou não há solicitações de checklist aguardando assinatura do responsável.
          </p>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3">
        {pending.map(item => (
          <div key={item.id} className="border p-3 rounded">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{item.user?.name || item.userId}</div>
                <div className="text-sm text-gray-600">Checklist: {item.checklistType} - Criado: {new Date(item.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <button onClick={() => setSelected(item)} className="bg-blue-600 text-white px-3 py-1 rounded">Abrir</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded w-full max-w-2xl">
            <h2 className="text-lg font-bold mb-2">Aprovar justificativa</h2>
            <div>
              <p><strong>Colaborador:</strong> {selected.user?.name || selected.userId}</p>
              <p><strong>Checklist:</strong> {selected.checklistType}</p>
              <p className="mt-2"><strong>Descrição:</strong></p>
              <p className="border p-2 rounded">{selected.description}</p>
            </div>

            <div className="mt-4">
              <p>Assinatura do responsável (ADMIN)</p>
              <SignatureCanvas
                ref={sigRef}
                clearOnResize={false}
                onBegin={() => {
                  if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }
                }}
                canvasProps={{ className: 'w-full h-40 border', style: { touchAction: 'none', userSelect: 'none' } }}
              />
              <div className="flex gap-2 mt-2">
                <button onClick={() => { sigRef.current?.clear(); }} className="text-red-500 hover:text-red-600 transition">Limpar</button>
                <button onClick={() => handleApprove(selected)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Aprovar e Enviar</button>
                <button onClick={() => setSelected(null)} className="text-gray-600 border border-gray-300 rounded px-4 py-2 hover:border-gray-400 hover:text-gray-800 transition">Fechar</button>
              </div>
            </div>

            {message && (
              <div className={`mt-3 rounded-lg border p-3 ${messageType === 'success' ? 'border-green-200 bg-green-50 text-green-800' : messageType === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-blue-200 bg-blue-50 text-blue-800'}`}>
                {message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
