import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "@/lib/db";
import { Plus, Search, Loader2, AlertCircle, Building2, Pencil, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { STATUS_OBRA, formatDate, logHistorico } from "@/lib/bwork";
import ObraFormDialog from "@/components/obras/ObraFormDialog";

export default function Obras() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [obras, setObras] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await db.Obra.list("-created_date", 200);
      setObras(data);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = obras.filter((o) => {
    const matchSearch = !search || o.nome?.toLowerCase().includes(search.toLowerCase()) || o.cliente?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (obra) => {
    if (!confirm(`Excluir a obra "${obra.nome}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await db.Obra.delete(obra.id);
      await logHistorico(null, "excluiu", "obra", obra.id, `Obra "${obra.nome}" excluída`);
      toast({ title: "Obra excluída" });
      load();
    } catch (e) {
      toast({ title: "Erro ao excluir obra", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Obras</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie todas as obras da construtora.</p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Nova obra
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Buscar por nome ou cliente..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="sm:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(STATUS_OBRA).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>
      ) : error ? (
        <div className="flex flex-col items-center py-20 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
          <p className="text-slate-700 font-medium mb-4">Não foi possível carregar as obras.</p>
          <Button onClick={load} variant="outline">Tentar novamente</Button>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-slate-300">
          <CardContent className="p-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 mb-4">
              <Building2 className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900">{obras.length === 0 ? "Nenhuma obra cadastrada" : "Nenhuma obra encontrada"}</h3>
            <p className="text-slate-500 text-sm mt-1 mb-5">{obras.length === 0 ? "Comece cadastrando sua primeira obra." : "Ajuste a busca ou os filtros."}</p>
            {obras.length === 0 && (
              <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> Criar obra
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((o) => (
            <Card key={o.id} className="border-slate-200 hover:shadow-md transition-shadow group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <Link to={`/obras/${o.id}`} className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate hover:underline">{o.nome}</h3>
                    <p className="text-sm text-slate-500 truncate">{o.cliente || "Sem cliente"}</p>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2 text-slate-400">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditing(o); setDialogOpen(true); }}>
                        <Pencil className="w-4 h-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(o)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Link to={`/obras/${o.id}`} className="block mt-3">
                  {o.endereco && <p className="text-xs text-slate-500 truncate mb-3">{o.endereco}</p>}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={STATUS_OBRA[o.status]?.badge}>{STATUS_OBRA[o.status]?.label}</Badge>
                    <span className="text-xs text-slate-400">Início {formatDate(o.data_inicio)}</span>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ObraFormDialog open={dialogOpen} onOpenChange={setDialogOpen} obra={editing} onSaved={load} />
    </div>
  );
}