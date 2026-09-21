import React, { useState } from "react";
import { db } from "@/lib/db";
import { Plus, Pencil, Trash2, ListTodo, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { STATUS_TAREFA, PRIORIDADE, logHistorico } from "@/lib/bwork";
import TarefaFormDialog from "@/components/obras/TarefaFormDialog";

export default function ServicosTab({ obraId, ambientes, tarefas, membros, onRefresh }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const ambienteNome = (id) => ambientes.find((a) => a.id === id)?.nome || "—";
  const responsavelNome = (id) => membros.find((m) => m.id === id)?.full_name || membros.find((m) => m.id === id)?.email || "—";

  const filtered = tarefas.filter((t) => {
    const ms = !search || t.titulo?.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "all" || t.status === statusFilter;
    return ms && mf;
  });

  const quickStatus = async (tarefa, status) => {
    try {
      const payload = { status, completed_at: status === "concluido" ? new Date().toISOString() : null };
      await db.Tarefa.update(tarefa.id, payload);
      await logHistorico(obraId, status === "concluido" ? "concluiu" : "alterou", "tarefa", tarefa.id, `Status de "${tarefa.titulo}" alterado para ${STATUS_TAREFA[status].label}`);
      onRefresh();
    } catch (e) {
      toast({ title: "Erro ao atualizar status", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (t) => {
    if (!confirm(`Excluir o serviço "${t.titulo}"?`)) return;
    try {
      await db.Tarefa.delete(t.id);
      await logHistorico(obraId, "excluiu", "tarefa", t.id, `Serviço "${t.titulo}" excluído`);
      toast({ title: "Serviço excluído" });
      onRefresh();
    } catch (e) {
      toast({ title: "Erro ao excluir", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Buscar serviço..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.entries(STATUS_TAREFA).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Novo serviço</Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-slate-300"><CardContent className="p-10 text-center">
          <ListTodo className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">{tarefas.length === 0 ? "Nenhum serviço cadastrado." : "Nenhum serviço encontrado."}</p>
          {tarefas.length === 0 && <Button className="mt-4" onClick={() => { setEditing(null); setOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Criar serviço</Button>}
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <Card key={t.id} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-slate-900">{t.titulo}</h4>
                      <Badge variant="outline" className={STATUS_TAREFA[t.status]?.badge}>{STATUS_TAREFA[t.status]?.label}</Badge>
                      <Badge variant="outline" className={PRIORIDADE[t.prioridade]?.badge}>{PRIORIDADE[t.prioridade]?.label}</Badge>
                    </div>
                    {t.descricao && <p className="text-sm text-slate-500 mt-1">{t.descricao}</p>}
                    <div className="flex gap-4 text-xs text-slate-500 mt-2">
                      <span>Ambiente: {ambienteNome(t.ambiente_id)}</span>
                      <span>Responsável: {responsavelNome(t.responsavel_id)}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {t.status !== "concluido" && (
                      <Button size="sm" variant="outline" onClick={() => quickStatus(t, "concluido")}>Concluir</Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(t); setOpen(true); }}><Pencil className="w-4 h-4 text-slate-500" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(t)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <TarefaFormDialog open={open} onOpenChange={setOpen} obraId={obraId} tarefa={editing} ambientes={ambientes} membros={membros} onSaved={onRefresh} />
    </div>
  );
}