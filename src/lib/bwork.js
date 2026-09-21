import { db } from "@/lib/db";

export const STATUS_OBRA = {
  planejamento: { label: "Planejamento", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  andamento: { label: "Em andamento", badge: "bg-blue-100 text-blue-700 border-blue-200" },
  concluida: { label: "Concluída", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  pausada: { label: "Pausada", badge: "bg-amber-100 text-amber-700 border-amber-200" },
  cancelada: { label: "Cancelada", badge: "bg-red-100 text-red-700 border-red-200" },
};

export const STATUS_TAREFA = {
  pendente: { label: "Pendente", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  andamento: { label: "Em andamento", badge: "bg-blue-100 text-blue-700 border-blue-200" },
  concluido: { label: "Concluído", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelado: { label: "Cancelado", badge: "bg-red-100 text-red-700 border-red-200" },
};

export const PRIORIDADE = {
  baixa: { label: "Baixa", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  media: { label: "Média", badge: "bg-sky-100 text-sky-700 border-sky-200" },
  alta: { label: "Alta", badge: "bg-orange-100 text-orange-700 border-orange-200" },
  urgente: { label: "Urgente", badge: "bg-red-100 text-red-700 border-red-200" },
};

export const TIPO_REGISTRO = {
  ocorrencia: { label: "Ocorrência", badge: "bg-red-100 text-red-700 border-red-200" },
  vistoria: { label: "Vistoria", badge: "bg-blue-100 text-blue-700 border-blue-200" },
  servico: { label: "Serviço", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  observacao: { label: "Observação", badge: "bg-slate-100 text-slate-700 border-slate-200" },
  entrega: { label: "Entrega", badge: "bg-purple-100 text-purple-700 border-purple-200" },
  outro: { label: "Outro", badge: "bg-amber-100 text-amber-700 border-amber-200" },
};

export async function logHistorico(obra_id, acao, entidade, entidade_id, descricao) {
  try {
    await db.Historico.create({ obra_id: obra_id || null, acao, entidade, entidade_id, descricao });
  } catch (e) {
    console.error("Falha ao registrar histórico:", e);
  }
}

export function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}