import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "@/lib/db";
import { Building2, ListTodo, Plus, Loader2, AlertCircle, Activity, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_OBRA, formatDate } from "@/lib/bwork";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [obras, setObras] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [registros, setRegistros] = useState([]);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const [o, t, f, r] = await Promise.all([
        db.Obra.list("-created_date", 100),
        db.Tarefa.list("-created_date", 100),
        db.Foto.list("-created_date", 20),
        db.Registro.list("-created_date", 10),
      ]);
      setObras(o);
      setTarefas(t);
      setFotos(f);
      setRegistros(r);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
        <p className="text-slate-700 font-medium mb-1">Não foi possível carregar os dados.</p>
        <p className="text-slate-500 text-sm mb-4">Verifique sua conexão e tente novamente.</p>
        <Button onClick={load}>Tentar novamente</Button>
      </div>
    );
  }

  const andamento = obras.filter((o) => o.status === "andamento").length;
  const concluidas = obras.filter((o) => o.status === "concluida").length;
  const tarefasPendentes = tarefas.filter((t) => t.status === "pendente" || t.status === "andamento").length;
  const tarefasConcluidas = tarefas.filter((t) => t.status === "concluido").length;

  const stats = [
    { label: "Obras", value: obras.length, icon: Building2, color: "text-slate-900" },
    { label: "Em andamento", value: andamento, icon: Activity, color: "text-blue-600" },
    { label: "Concluídas", value: concluidas, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Tarefas pendentes", value: tarefasPendentes, icon: ListTodo, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Visão geral das suas obras e atividades.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 font-medium">{s.label}</span>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-3xl font-bold text-slate-900 mt-2">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {obras.length === 0 ? (
        <Card className="border-dashed border-slate-300">
          <CardContent className="p-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 mb-4">
              <Building2 className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Bem-vindo ao B-Work</h3>
            <p className="text-slate-500 text-sm mt-1 mb-5 max-w-md mx-auto">
              Você ainda não possui obras cadastradas. Comece cadastrando sua primeira obra para acompanhar a execução dos serviços.
            </p>
            <Link to="/obras">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira obra
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Obras recentes</h3>
                <Link to="/obras" className="text-sm text-slate-600 hover:text-slate-900 font-medium">Ver todas</Link>
              </div>
              <div className="space-y-2">
                {obras.slice(0, 5).map((o) => (
                  <Link key={o.id} to={`/obras/${o.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 truncate">{o.nome}</div>
                      <div className="text-xs text-slate-500">{o.cliente || "Sem cliente"} · Início {formatDate(o.data_inicio)}</div>
                    </div>
                    <Badge variant="outline" className={STATUS_OBRA[o.status]?.badge}>{STATUS_OBRA[o.status]?.label}</Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Registros recentes</h3>
              {registros.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum registro.</p>
              ) : (
                <div className="space-y-3">
                  {registros.map((r) => (
                    <div key={r.id} className="text-sm">
                      <div className="font-medium text-slate-800 truncate">{r.titulo}</div>
                      <div className="text-xs text-slate-500">{formatDate(r.created_date)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}