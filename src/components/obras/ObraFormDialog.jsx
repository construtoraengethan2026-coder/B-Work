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
import { STATUS_OBRA, logHistorico } from "@/lib/bwork";

const empty = { nome: "", descricao: "", cliente: "", endereco: "", status: "planejamento", data_inicio: "", previsao_conclusao: "" };

export default function ObraFormDialog({ open, onOpenChange, obra, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(obra ? { ...empty, ...obra } : empty);
      setErrors({});
    }
  }, [open, obra]);

  const validate = () => {
    const e = {};
    if (!form.nome?.trim()) e.nome = "Nome da obra é obrigatório";
    if (form.previsao_conclusao && form.data_inicio && form.previsao_conclusao < form.data_inicio) {
      e.previsao_conclusao = "Previsão não pode ser anterior ao início";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        nome: form.nome.trim(),
        descricao: form.descricao?.trim() || "",
        cliente: form.cliente?.trim() || "",
        endereco: form.endereco?.trim() || "",
        status: form.status,
        data_inicio: form.data_inicio || null,
        previsao_conclusao: form.previsao_conclusao || null,
      };
      if (obra) {
        await db.Obra.update(obra.id, payload);
        await logHistorico(obra.id, "editou", "obra", obra.id, `Obra "${payload.nome}" atualizada`);
        toast({ title: "Obra atualizada" });
      } else {
        const created = await db.Obra.create(payload);
        await logHistorico(created.id, "criou", "obra", created.id, `Obra "${payload.nome}" criada`);
        toast({ title: "Obra criada" });
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast({ title: "Erro ao salvar obra", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{obra ? "Editar obra" : "Nova obra"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome da obra *</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Residencial Silva" />
            {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
          </div>
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Input value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} placeholder="Nome do cliente" />
          </div>
          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} placeholder="Endereço da obra" />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={2} placeholder="Detalhes da obra" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_OBRA).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Data de início</Label>
              <Input type="date" value={form.data_inicio || ""} onChange={(e) => setForm({ ...form, data_inicio: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Previsão de conclusão</Label>
              <Input type="date" value={form.previsao_conclusao || ""} onChange={(e) => setForm({ ...form, previsao_conclusao: e.target.value })} />
              {errors.previsao_conclusao && <p className="text-xs text-red-500">{errors.previsao_conclusao}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar obra
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}