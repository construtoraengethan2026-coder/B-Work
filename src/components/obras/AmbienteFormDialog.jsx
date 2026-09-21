import React, { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { logHistorico } from "@/lib/bwork";

export default function AmbienteFormDialog({ open, onOpenChange, obraId, ambiente, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ nome: "", descricao: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(ambiente ? { nome: ambiente.nome || "", descricao: ambiente.descricao || "" } : { nome: "", descricao: "" });
      setError("");
    }
  }, [open, ambiente]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome?.trim()) { setError("Nome é obrigatório"); return; }
    setSaving(true);
    try {
      const payload = { obra_id: obraId, nome: form.nome.trim(), descricao: form.descricao?.trim() || "" };
      if (ambiente) {
        await db.Ambiente.update(ambiente.id, payload);
        await logHistorico(obraId, "editou", "ambiente", ambiente.id, `Ambiente "${payload.nome}" atualizado`);
        toast({ title: "Ambiente atualizado" });
      } else {
        const created = await db.Ambiente.create(payload);
        await logHistorico(obraId, "criou", "ambiente", created.id, `Ambiente "${payload.nome}" criado`);
        toast({ title: "Ambiente criado" });
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast({ title: "Erro ao salvar ambiente", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{ambiente ? "Editar ambiente" : "Novo ambiente"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Sala, Cozinha, Banheiro" />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={2} />
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