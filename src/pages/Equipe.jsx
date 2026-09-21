import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/db";
import { Users, Loader2, AlertCircle, Shield, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { initials, formatDate } from "@/lib/bwork";

export default function Equipe() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === "admin";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await db.User.list();
      setUsers(data);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleRole = async (u) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    try {
      await db.User.update(u.id, { role: newRole });
      toast({ title: "Permissão atualizada", description: `${u.full_name || u.email} agora é ${newRole === "admin" ? "Administrador" : "Funcionário"}` });
      load();
    } catch (e) {
      toast({ title: "Erro ao alterar permissão", description: e.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>;
  if (error) return (
    <div className="flex flex-col items-center py-24 text-center">
      <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
      <p className="text-slate-700 font-medium mb-4">Não foi possível carregar a equipe.</p>
      <Button onClick={load} variant="outline">Tentar novamente</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Equipe</h1>
        <p className="text-slate-500 text-sm mt-1">Usuários cadastrados no sistema.</p>
      </div>

      {users.length === 0 ? (
        <Card className="border-dashed border-slate-300"><CardContent className="p-10 text-center">
          <Users className="w-8 h-8 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Nenhum usuário cadastrado.</p>
        </CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {users.map((u) => (
            <Card key={u.id} className="border-slate-200">
              <CardContent className="p-4 flex items-center gap-3">
                <Avatar className="w-11 h-11"><AvatarFallback className="bg-slate-200 text-slate-700">{initials(u.full_name || u.email)}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 truncate">{u.full_name || "Usuário"}</div>
                  <div className="text-xs text-slate-500 truncate">{u.email}</div>
                  <div className="text-xs text-slate-400">Cadastrado em {formatDate(u.created_date)}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className={u.role === "admin" ? "bg-slate-900 text-white border-slate-900" : "bg-slate-100 text-slate-700 border-slate-200"}>
                    {u.role === "admin" ? <><Shield className="w-3 h-3 mr-1" /> Admin</> : <><UserIcon className="w-3 h-3 mr-1" /> Funcionário</>}
                  </Badge>
                  {isAdmin && u.id !== user.id && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleRole(u)}>
                      {u.role === "admin" ? "Tornar funcionário" : "Tornar admin"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}