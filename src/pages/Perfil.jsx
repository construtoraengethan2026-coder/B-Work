import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { auth } from "@/lib/auth";
import { User, Loader2, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { initials } from "@/lib/bwork";

export default function Perfil() {
  const { user, checkUserAuth } = useAuth();
  const { toast } = useToast();
  const [nome, setNome] = useState(user?.full_name || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return;
    setSaving(true);
    try {
      await auth.updateMe({ full_name: nome.trim() });
      await checkUserAuth();
      toast({ title: "Perfil atualizado" });
    } catch (err) {
      toast({ title: "Erro ao atualizar perfil", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Perfil</h1>
        <p className="text-slate-500 text-sm mt-1">Gerencie suas informações.</p>
      </div>

      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16"><AvatarFallback className="bg-slate-200 text-slate-700 text-xl">{initials(user?.full_name || user?.email)}</AvatarFallback></Avatar>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{user?.full_name || "Usuário"}</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <Badge variant="outline" className="mt-1 capitalize">{user?.role === "admin" ? "Administrador" : "Funcionário"}</Badge>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome completo</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={user?.email || ""} disabled className="bg-slate-50" />
              <p className="text-xs text-slate-400">O e-mail não pode ser alterado.</p>
            </div>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Salvar alterações</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}