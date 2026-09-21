import React, { useEffect, useState } from "react";
import { db } from "@/lib/db";
import { useAuth } from "@/lib/AuthContext";
import { UserPlus, Trash2, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { initials, formatDate, logHistorico } from "@/lib/bwork";

export default function EquipeTab({ obraId, membros, onRefresh }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [adding, setAdding] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const u = await db.User.list();
      setAllUsers(u);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const memberUsers = membros.map((m) => allUsers.find((u) => u.id === m.user_id)).filter(Boolean);
  const availableUsers = allUsers.filter((u) => !membros.some((m) => m.user_id === u.id));

  const handleAdd = async () => {
    if (!selectedUser) return;
    setAdding(true);
    try {
      await db.MembroObra.create({ obra_id: obraId, user_id: selectedUser });
      const u = allUsers.find((x) => x.id === selectedUser);
      await logHistorico(obraId, "adicionou", "membro", selectedUser, `${u?.full_name || u?.email} adicionado à equipe`);
      toast({ title: "Membro adicionado" });
      setSelectedUser("");
      onRefresh();
    } catch (e) {
      toast({ title: "Erro ao adicionar membro", description: e.message, variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (m) => {
    const u = allUsers.find((x) => x.id === m.user_id);
    if (!confirm(`Remover ${u?.full_name || u?.email} da equipe?`)) return;
    try {
      await db.MembroObra.delete(m.id);
      await logHistorico(obraId, "removeu", "membro", m.user_id, `${u?.full_name || u?.email} removido da equipe`);
      toast({ title: "Membro removido" });
      onRefresh();
    } catch (e) {
      toast({ title: "Erro ao remover", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-slate-700">Adicionar membro</label>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger><SelectValue placeholder="Selecione um usuário" /></SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((u) => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <Button onClick={handleAdd} disabled={!selectedUser || adding}>
                <UserPlus className="w-4 h-4 mr-2" /> Adicionar
              </Button>
            </div>
            {availableUsers.length === 0 && !loading && <p className="text-xs text-slate-500 mt-2">Todos os usuários já são membros.</p>}
          </CardContent>
        </Card>
      )}

      {memberUsers.length === 0 ? (
        <Card className="border-dashed border-slate-300"><CardContent className="p-10 text-center">
          <Users className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Nenhum membro na equipe.</p>
          {!isAdmin && <p className="text-slate-500 text-sm mt-1">Apenas administradores podem adicionar membros.</p>}
        </CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {membros.map((m) => {
            const u = allUsers.find((x) => x.id === m.user_id);
            return (
              <Card key={m.id} className="border-slate-200">
                <CardContent className="p-4 flex items-center gap-3">
                  <Avatar className="w-10 h-10"><AvatarFallback className="bg-slate-200 text-slate-700 text-sm">{initials(u?.full_name || u?.email)}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 truncate">{u?.full_name || "Usuário"}</div>
                    <div className="text-xs text-slate-500 truncate">{u?.email}</div>
                    <div className="text-xs text-slate-400">Entrou em {formatDate(m.created_date)}</div>
                  </div>
                  {isAdmin && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemove(m)}><Trash2 className="w-4 h-4 text-red-500" /></Button>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}