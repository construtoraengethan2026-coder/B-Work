import React from "react";
import { History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/AuthContext";
import { initials, formatDateTime } from "@/lib/bwork";

export default function HistoricoTab({ historico, users }) {
  const userName = (id) => users.find((u) => u.id === id)?.full_name || users.find((u) => u.id === id)?.email || "Sistema";

  if (historico.length === 0) {
    return (
      <Card className="border-dashed border-slate-300"><CardContent className="p-10 text-center">
        <History className="w-8 h-8 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">Nenhuma atividade registrada.</p>
        <p className="text-slate-500 text-sm mt-1">As ações realizadas na obra aparecerão aqui.</p>
      </CardContent></Card>
    );
  }

  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-200" />
      <div className="space-y-3">
        {historico.map((h) => (
          <div key={h.id} className="relative">
            <div className="absolute -left-[18px] top-2 w-3 h-3 rounded-full bg-slate-300 border-2 border-white" />
            <Card className="border-slate-200">
              <CardContent className="p-3.5 flex items-start gap-3">
                <Avatar className="w-8 h-8 shrink-0"><AvatarFallback className="bg-slate-200 text-slate-700 text-xs">{initials(userName(h.created_by_id))}</AvatarFallback></Avatar>
                <div className="min-w-0">
                  <p className="text-sm text-slate-800"><span className="font-medium">{userName(h.created_by_id)}</span> {h.descricao || h.acao}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(h.created_date)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}