import React, { useState } from "react";
import { db, uploadPhoto } from "@/lib/db";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Camera, Loader2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { logHistorico } from "@/lib/bwork";

export default function PhotoUploader({ open, onOpenChange, obraId, ambientes, onSaved }) {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [legenda, setLegenda] = useState("");
  const [ambienteId, setAmbienteId] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => { setFile(null); setPreview(""); setLegenda(""); setAmbienteId(""); };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { toast({ title: "Selecione uma foto", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const { file_url } = await uploadPhoto(file);
      const created = await db.Foto.create({
        obra_id: obraId,
        ambiente_id: ambienteId || null,
        file_url,
        legenda: legenda.trim(),
      });
      await logHistorico(obraId, "enviou", "foto", created.id, "Foto adicionada à obra");
      toast({ title: "Foto enviada" });
      reset();
      onOpenChange(false);
      onSaved();
    } catch (err) {
      toast({ title: "Erro ao enviar foto", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Enviar foto</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {preview ? (
            <div className="relative rounded-lg overflow-hidden border border-slate-200">
              <img src={preview} alt="preview" className="w-full h-48 object-cover" />
              <button type="button" onClick={() => { setFile(null); setPreview(""); }} className="absolute top-2 right-2 bg-slate-900/70 text-white rounded-full p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
              <Camera className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-sm text-slate-600 font-medium">Tirar foto ou selecionar</span>
              <span className="text-xs text-slate-400 mt-1">Câmera ou galeria</span>
              <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
            </label>
          )}
          <div className="space-y-2">
            <Label>Ambiente</Label>
            <Select value={ambienteId || "none"} onValueChange={(v) => setAmbienteId(v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {ambientes.map((a) => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Legenda</Label>
            <Textarea value={legenda} onChange={(e) => setLegenda(e.target.value)} rows={2} placeholder="Descrição da foto" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving || !file}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Enviar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}