import React, { useState } from "react";
import { db } from "@/lib/db";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { TIPO_REGISTRO, formatDateTime, logHistorico } from "@/lib/bwork";
import RegistroFormDialog from "@/components/obras/RegistroFormDialog";

export default function RegistrosTab({ obraId, ambientes, registros, onRefresh }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const ambienteNome = (id) => ambientes.find((a) => a.id === id)?.nome || "Geral";

  const handleDelete = async (r) => {
    if (!confirm(`Excluir o registro "${r.titulo}"?`)) return;
    try {
      await db.Registro.delete(r.id);
      await logHistorico(obraId, "excluiu", "registro", r.id, `Registro "${r.titulo}" excluído`);
      toast({ title: "Registro excluído" });
      onRefresh();
    } catch (e) {
      toast({ title: "Erro ao excluir", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Novo registro</Button>
      </div>
      {registros.length === 0 ? (
        <Card className="border-dashed border-slate-300"><CardContent className="p-10 text-center">
          <FileText className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Nenhum registro.</p>
          <p className="text-slate-500 text-sm mt-1 mb-4">Registre ocorrências, vistorias, observações e mais.</p>
          <Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Criar registro</Button>
        </CardContent></Card>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-200" />
          <div className="space-y-4">
            {registros.map((r) => (
              <div key={r.id} className="relative">
                <div className="absolute -left-[18px] top-3 w-3 h-3 rounded-full bg-slate-300 border-2 border-white" />
                <Card className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={TIPO_REGISTRO[r.tipo]?.badge}>{TIPO_REGISTRO[r.tipo]?.label}</Badge>
                          <h4 className="font-medium text-slate-900">{r.titulo}</h4>
                        </div>
                        {r.descricao && <p className="text-sm text-slate-600 mt-1.5 whitespace-pre-wrap">{r.descricao}</p>}
                        <div className="flex gap-4 text-xs text-slate-400 mt-2">
                          <span>Ambiente: {ambienteNome(r.ambiente_id)}</span>
                          <span>{formatDateTime(r.created_date)}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="w-4 h-4 text-slate-500" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(r)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
      <RegistroFormDialog open={open} onOpenChange={setOpen} obraId={obraId} registro={editing} ambientes={ambientes} onSaved={onRefresh} />
    </div>
  );
}