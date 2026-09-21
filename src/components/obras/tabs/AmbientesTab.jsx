import React, { useState } from "react";
import { db } from "@/lib/db";
import { Plus, Pencil, Trash2, Loader2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { logHistorico } from "@/lib/bwork";
import AmbienteFormDialog from "@/components/obras/AmbienteFormDialog";

export default function AmbientesTab({ obraId, ambientes, onRefresh }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleDelete = async (a) => {
    if (!confirm(`Excluir o ambiente "${a.nome}"?`)) return;
    try {
      await db.Ambiente.delete(a.id);
      await logHistorico(obraId, "excluiu", "ambiente", a.id, `Ambiente "${a.nome}" excluído`);
      toast({ title: "Ambiente excluído" });
      onRefresh();
    } catch (e) {
      toast({ title: "Erro ao excluir", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Novo ambiente</Button>
      </div>
      {ambientes.length === 0 ? (
        <Card className="border-dashed border-slate-300"><CardContent className="p-10 text-center">
          <Layers className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Nenhum ambiente cadastrado.</p>
          <p className="text-slate-500 text-sm mt-1 mb-4">Cadiente ambientes como Sala, Cozinha, Banheiro, etc.</p>
          <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Criar ambiente</Button>
        </CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ambientes.map((a) => (
            <Card key={a.id} className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h4 className="font-medium text-slate-900 truncate">{a.nome}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{a.descricao || "Sem descrição"}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(a); setOpen(true); }}><Pencil className="w-4 h-4 text-slate-500" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(a)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <AmbienteFormDialog open={open} onOpenChange={setOpen} obraId={obraId} ambiente={editing} onSaved={onRefresh} />
    </div>
  );
}