import React, { useState } from "react";
import { db } from "@/lib/db";
import { Camera, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Image as ImageComponent } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";
import { logHistorico, formatDateTime } from "@/lib/bwork";
import PhotoUploader from "@/components/obras/PhotoUploader";

export default function FotosTab({ obraId, ambientes, fotos, onRefresh }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [ambFilter, setAmbFilter] = useState("all");

  const ambienteNome = (id) => ambientes.find((a) => a.id === id)?.nome || "Geral";
  const filtered = fotos.filter((f) => ambFilter === "all" || f.ambiente_id === ambFilter);

  const handleDelete = async (f) => {
    if (!confirm("Excluir esta foto?")) return;
    try {
      await db.Foto.delete(f.id);
      await logHistorico(obraId, "excluiu", "foto", f.id, "Foto excluída");
      toast({ title: "Foto excluída" });
      onRefresh();
    } catch (e) {
      toast({ title: "Erro ao excluir", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <Select value={ambFilter} onValueChange={setAmbFilter}>
          <SelectTrigger className="sm:w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os ambientes</SelectItem>
            {ambientes.map((a) => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setOpen(true)}><Camera className="w-4 h-4 mr-2" /> Tirar foto</Button>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed border-slate-300"><CardContent className="p-10 text-center">
          <Camera className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">{fotos.length === 0 ? "Nenhuma foto enviada." : "Nenhuma foto neste filtro."}</p>
          <p className="text-slate-500 text-sm mt-1 mb-4">Use a câmera do celular para registrar o andamento.</p>
          <Button onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> Enviar foto</Button>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((f) => (
            <Card key={f.id} className="border-slate-200 overflow-hidden group">
              <div className="relative aspect-square bg-slate-100">
                <ImageComponent src={f.file_url} alt={f.legenda || "foto"} fittingType="cover" className="w-full h-full" />
                <button onClick={() => handleDelete(f)} className="absolute top-2 right-2 bg-slate-900/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-2.5">
                <Badge variant="outline" className="text-[10px] mb-1">{ambienteNome(f.ambiente_id)}</Badge>
                {f.legenda && <p className="text-xs text-slate-600 line-clamp-2">{f.legenda}</p>}
                <p className="text-[10px] text-slate-400 mt-1">{formatDateTime(f.created_date)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
      <PhotoUploader open={open} onOpenChange={setOpen} obraId={obraId} ambientes={ambientes} onSaved={onRefresh} />
    </div>
  );
}