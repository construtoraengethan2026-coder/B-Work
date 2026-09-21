import React from "react";
import { Building2, MapPin, Calendar, User, Layers, ListTodo, Camera, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_OBRA, formatDate } from "@/lib/bwork";

export default function VisaoGeral({ obra, ambientes, tarefas, fotos, membros }) {
  const stats = [
    { label: "Ambientes", value: ambientes.length, icon: Layers },
    { label: "Serviços", value: tarefas.length, icon: ListTodo },
    { label: "Fotos", value: fotos.length, icon: Camera },
    { label: "Equipe", value: membros.length, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-slate-900">Informações da obra</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600"><Building2 className="w-4 h-4 text-slate-400" /> {obra.cliente || "Sem cliente"}</div>
              <div className="flex items-center gap-2 text-slate-600"><MapPin className="w-4 h-4 text-slate-400" /> {obra.endereco || "Sem endereço"}</div>
              <div className="flex items-center gap-2 text-slate-600"><Calendar className="w-4 h-4 text-slate-400" /> Início: {formatDate(obra.data_inicio)}</div>
              <div className="flex items-center gap-2 text-slate-600"><Calendar className="w-4 h-4 text-slate-400" /> Previsão: {formatDate(obra.previsao_conclusao)}</div>
              <div className="flex items-center gap-2"><span className="text-slate-400 text-sm">Status:</span> <Badge variant="outline" className={STATUS_OBRA[obra.status]?.badge}>{STATUS_OBRA[obra.status]?.label}</Badge></div>
            </div>
            {obra.descricao && <p className="text-sm text-slate-600 pt-2 border-t border-slate-100">{obra.descricao}</p>}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Resumo</h3>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <s.icon className="w-5 h-5 text-slate-500" />
                  <div>
                    <div className="text-xl font-bold text-slate-900">{s.value}</div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}