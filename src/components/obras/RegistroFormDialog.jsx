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
import { TIPO_REGISTRO, logHistorico } from "@/lib/bwork";

const empty = { titulo: "", descricao: "", tipo: "observacao", ambiente_id: "" };

export default function RegistroFormDialog({ open, onOpenChange, obraId, registro, ambientes, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(registro ? { ...empty, ...registro, ambiente_id: registro.ambiente_id || "" } : empty);
      setError("");
    }
  }, [open, registro]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.titulo?.trim()) { setError("Título é obrigatório"); return; }
    setSaving(true);
    try {
      const payload = {
        obra_id: obraId,
        titulo: form.titulo.trim(),
        descricao: form.descricao?.trim() || "",
        tipo: form.tipo,
        ambiente_id: form.ambiente_id || null,
      };
      if (registro) {
        await db.Registro.update(registro.id, payload);
        await logHistorico(obraId, "editou", "registro", registro.id, `Registro "${payload.titulo}" atualizado`);
        toast({ title: "Registro atualizado" });
      } else {
        const created = await db.Registro.create(payload);
        await logHistorico(obraId, "criou", "registro", created.id, `Registro "${payload.titulo}" criado`);
        toast({ title: "Registro criado" });
      }
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast({ title: "Erro ao salvar registro", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{registro ? "Editar registro" : "Novo registro"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPO_REGISTRO).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
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
          </div>
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título do registro" />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} rows={4} />
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