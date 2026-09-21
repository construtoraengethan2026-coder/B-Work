import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "@/lib/db";
import { ArrowLeft, Loader2, AlertCircle, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { STATUS_OBRA, logHistorico } from "@/lib/bwork";
import ObraFormDialog from "@/components/obras/ObraFormDialog";
import VisaoGeral from "@/components/obras/tabs/VisaoGeral";
import AmbientesTab from "@/components/obras/tabs/AmbientesTab";
import ServicosTab from "@/components/obras/tabs/ServicosTab";
import FotosTab from "@/components/obras/tabs/FotosTab";
import RegistrosTab from "@/components/obras/tabs/RegistrosTab";
import EquipeTab from "@/components/obras/tabs/EquipeTab";
import HistoricoTab from "@/components/obras/tabs/HistoricoTab";
import RelatoriosTab from "@/components/obras/tabs/RelatoriosTab";

export default function ObraDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [obra, setObra] = useState(null);
  const [ambientes, setAmbientes] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [membros, setMembros] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [users, setUsers] = useState([]);
  const [editOpen, setEditOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [o, amb, tar, fot, reg, mem, hist, usr] = await Promise.all([
        db.Obra.get(id).catch(() => null),
        db.Ambiente.filter({ obra_id: id }, "-created_date", 200),
        db.Tarefa.filter({ obra_id: id }, "-created_date", 200),
        db.Foto.filter({ obra_id: id }, "-created_date", 200),
        db.Registro.filter({ obra_id: id }, "-created_date", 200),
        db.MembroObra.filter({ obra_id: id }, "-created_date", 200),
        db.Historico.filter({ obra_id: id }, "-created_date", 200),
        db.User.list().catch(() => []),
      ]);
      if (!o) { setError(true); return; }
      setObra(o); setAmbientes(amb); setTarefas(tar); setFotos(fot);
      setRegistros(reg); setMembros(mem); setHistorico(hist); setUsers(usr);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!confirm(`Excluir a obra "${obra.nome}"?`)) return;
    try {
      await db.Obra.delete(obra.id);
      await logHistorico(null, "excluiu", "obra", obra.id, `Obra "${obra.nome}" excluída`);
      toast({ title: "Obra excluída" });
      navigate("/obras");
    } catch (e) {
      toast({ title: "Erro ao excluir", description: e.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>;
  if (error || !obra) return (
    <div className="flex flex-col items-center py-24 text-center">
      <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
      <p className="text-slate-700 font-medium mb-4">Não foi possível carregar esta obra.</p>
      <Link to="/obras"><Button variant="outline">Voltar para obras</Button></Link>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/obras"><Button variant="ghost" size="icon" className="h-9 w-9"><ArrowLeft className="w-5 h-5" /></Button></Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight truncate">{obra.nome}</h1>
          <p className="text-slate-500 text-sm">{obra.cliente || "Sem cliente"}</p>
        </div>
        <Badge variant="outline" className={STATUS_OBRA[obra.status]?.badge}>{STATUS_OBRA[obra.status]?.label}</Badge>
        <Button variant="outline" size="icon" onClick={() => setEditOpen(true)}><Pencil className="w-4 h-4" /></Button>
        <Button variant="outline" size="icon" onClick={handleDelete}><Trash2 className="w-4 h-4 text-red-500" /></Button>
      </div>

      <Tabs defaultValue="visao" className="w-full">
        <div className="overflow-x-auto -mx-1 px-1">
          <TabsList className="bg-slate-100 p-1 h-auto flex-wrap">
            <TabsTrigger value="visao">Visão geral</TabsTrigger>
            <TabsTrigger value="ambientes">Ambientes</TabsTrigger>
            <TabsTrigger value="servicos">Serviços</TabsTrigger>
            <TabsTrigger value="fotos">Fotos</TabsTrigger>
            <TabsTrigger value="registros">Registros</TabsTrigger>
            <TabsTrigger value="equipe">Equipe</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
            <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="visao" className="mt-6"><VisaoGeral obra={obra} ambientes={ambientes} tarefas={tarefas} fotos={fotos} membros={membros} /></TabsContent>
        <TabsContent value="ambientes" className="mt-6"><AmbientesTab obraId={obra.id} ambientes={ambientes} onRefresh={load} /></TabsContent>
        <TabsContent value="servicos" className="mt-6"><ServicosTab obraId={obra.id} ambientes={ambientes} tarefas={tarefas} membros={[...users, ...membros.map(m => users.find(u => u.id === m.user_id)).filter(Boolean)]} onRefresh={load} /></TabsContent>
        <TabsContent value="fotos" className="mt-6"><FotosTab obraId={obra.id} ambientes={ambientes} fotos={fotos} onRefresh={load} /></TabsContent>
        <TabsContent value="registros" className="mt-6"><RegistrosTab obraId={obra.id} ambientes={ambientes} registros={registros} onRefresh={load} /></TabsContent>
        <TabsContent value="equipe" className="mt-6"><EquipeTab obraId={obra.id} membros={membros} onRefresh={load} /></TabsContent>
        <TabsContent value="historico" className="mt-6"><HistoricoTab historico={historico} users={users} /></TabsContent>
        <TabsContent value="relatorios" className="mt-6"><RelatoriosTab obra={obra} ambientes={ambientes} tarefas={tarefas} fotos={fotos} registros={registros} membros={membros} /></TabsContent>
      </Tabs>

      <ObraFormDialog open={editOpen} onOpenChange={setEditOpen} obra={obra} onSaved={load} />
    </div>
  );
}