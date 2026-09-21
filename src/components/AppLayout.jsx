import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Building2, LayoutDashboard, HardHat, Users, User, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/bwork";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/obras", label: "Obras", icon: Building2 },
  { to: "/equipe", label: "Equipe", icon: Users },
  { to: "/perfil", label: "Perfil", icon: User },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => logout(true);

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-200">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-900 text-white">
          <HardHat className="w-5 h-5" />
        </div>
        <div className="leading-tight">
          <div className="font-bold text-slate-900 tracking-tight">B-WORK</div>
          <div className="text-[11px] text-slate-500 -mt-0.5">Construtora Engethan</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            <item.icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-slate-200 text-slate-700 text-sm">{initials(user?.full_name || user?.email)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">{user?.full_name || "Usuário"}</div>
            <div className="text-xs text-slate-500 truncate">{user?.email}</div>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-slate-900 mt-1" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <button className="absolute top-4 right-4 text-slate-500" onClick={() => setMobileOpen(false)}>
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center justify-between h-14 px-4 bg-white border-b border-slate-200">
          <button onClick={() => setMobileOpen(true)} className="text-slate-700">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <HardHat className="w-5 h-5 text-slate-900" />
            <span className="font-bold text-slate-900">B-WORK</span>
          </div>
          <Link to="/perfil">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-slate-200 text-slate-700 text-xs">{initials(user?.full_name || user?.email)}</AvatarFallback>
            </Avatar>
          </Link>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}