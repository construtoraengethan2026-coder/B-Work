import React, { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { STATUS_TAREFA, PRIORIDADE, logHistorico } from "@/lib/bwork";

const empty = { titulo: "", descricao: "", ambiente_id: "", responsavel_id: "", status: "pendente", prioridade: "media" };

export default function TarefaFormDialog({ open, onOpenChange, obraId, tarefa, ambientes, membros, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(tarefa ? { ...empty, ...tarefa, ambiente_id: tarefa.ambiente_id || "", responsavel_id: tarefa.responsavel_id || "" } : empty);
      setError("");
    }
  }, [open, tarefa]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo?.trim()) { setError("Título é obrigatório"); return; }
    setSaving(true);
    try {
      const payload = {
        obra_id: obraId,
        titulo: form.titulo.trim(),
        descricao: form.descricao?.trim() || "",
        ambiente_id: form.ambiente_id || null,
        responsavel_id: form.responsavel_id || null,
        status: form.status,
        prioridade: form.prioridade,
      };
      if (tarefa) {
        const wasConcluido = tarefa.status === "concluido";
        const nowConcluido = payload.status === "concluido";
        if (nowConcluido && !wasConcluido) payload.completed_at = new Date().toISOString();
        if (!nowConcluido) payload.completed_at = null;
        await db.Tarefa.update(tarefa.id, payload);
        await logHistorico(obraId, "editou", "tarefa", tarefa.id, `Tarefa "${payload.titulo}" atualizada`);
        toast({ title: "Serviço atualizado" });
      } else {
        const created = await db.Tarefa.create(payload);
        await logHistorico(obraId, "criou", "tarefa", created.id, `Serviço "${payload.titulo}" criado`);
        toast({ title: "Serviço criado" });
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast({ title: "Erro ao salvar serviço", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{tarefa ? "Editar serviço" : "Novo serviço"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Pintura da sala" />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Ambiente</Label>
              <Select value={form.ambiente_id || "none"} onValueChange={(v) => setForm({ ...form, ambiente_id: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {ambientes.map((a) => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select value={form.responsavel_id || "none"} onValueChange={(v) => setForm({ ...form, responsavel_id: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {membros.map((m) => <SelectItem key={m.id} value={m.id}>{m.full_name || m.email}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_TAREFA).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={form.prioridade} onValueChange={(v) => setForm({ ...form, prioridade: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORIDADE).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}