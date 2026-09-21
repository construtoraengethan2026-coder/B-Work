import React from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { STATUS_TAREFA, PRIORIDADE, TIPO_REGISTRO, formatDate } from "@/lib/bwork";

export default function RelatoriosTab({ obra, ambientes, tarefas, fotos, registros, membros }) {
  const byStatus = Object.keys(STATUS_TAREFA).map((k) => ({ key: k, label: STATUS_TAREFA[k].label, count: tarefas.filter((t) => t.status === k).length }));
  const byPrioridade = Object.keys(PRIORIDADE).map((k) => ({ key: k, label: PRIORIDADE[k].label, count: tarefas.filter((t) => t.prioridade === k).length }));
  const byTipo = Object.keys(TIPO_REGISTRO).map((k) => ({ key: k, label: TIPO_REGISTRO[k].label, count: registros.filter((r) => r.tipo === k).length }));
  const total = tarefas.length || 1;
  const concluidoPct = Math.round((tarefas.filter((t) => t.status === "concluido").length / total) * 100);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" /> Imprimir</Button>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-5">
          <h3 className="font-semibold text-slate-900 mb-1">Relatório da Obra</h3>
          <p className="text-sm text-slate-500 mb-4">{obra.nome} · {obra.cliente} · Gerado em {formatDate(new Date().toISOString())}</p>

          <div className="mb-5">
            <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">Progresso geral</span><span className="font-medium text-slate-900">{concluidoPct}%</span></div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${concluidoPct}%` }} />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Serviços por status</h4>
              <div className="space-y-1.5">
                {byStatus.map((s) => (
                  <div key={s.key} className="flex justify-between text-sm"><span className="text-slate-600">{s.label}</span><span className="font-medium text-slate-900">{s.count}</span></div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Por prioridade</h4>
              <div className="space-y-1.5">
                {byPrioridade.map((s) => (
                  <div key={s.key} className="flex justify-between text-sm"><span className="text-slate-600">{s.label}</span><span className="font-medium text-slate-900">{s.count}</span></div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Registros por tipo</h4>
              <div className="space-y-1.5">
                {byTipo.map((s) => (
                  <div key={s.key} className="flex justify-between text-sm"><span className="text-slate-600">{s.label}</span><span className="font-medium text-slate-900">{s.count}</span></div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
            <div className="text-center"><div className="text-2xl font-bold text-slate-900">{ambientes.length}</div><div className="text-xs text-slate-500">Ambientes</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-slate-900">{fotos.length}</div><div className="text-xs text-slate-500">Fotos</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-slate-900">{registros.length}</div><div className="text-xs text-slate-500">Registros</div></div>
            <div className="text-center"><div className="text-2xl font-bold text-slate-900">{membros.length}</div><div className="text-xs text-slate-500">Equipe</div></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}