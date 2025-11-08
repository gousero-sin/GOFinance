import { useAuth } from "@/_core/hooks/useAuth";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  Sparkles, 
  LogOut,
  User,
  Settings as SettingsIcon
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { ReactNode } from "react";

interface FinanceDashboardLayoutProps {
  children: ReactNode;
}

export function FinanceDashboardLayout({ children }: FinanceDashboardLayoutProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [location] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <img src={APP_LOGO} alt={APP_TITLE} className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-shadow">{APP_TITLE}</h1>
          <p className="text-white/70 mb-6">Controle suas finanças com inteligência artificial</p>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="w-full glass-button text-white font-medium"
          >
            Entrar
          </Button>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/transactions", icon: ArrowLeftRight, label: "Transações" },
    { path: "/reports", icon: PieChart, label: "Relatórios" },
    { path: "/ai-assistant", icon: Sparkles, label: "AI Assistant" },
    { path: "/settings", icon: SettingsIcon, label: "Configurações" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="glass-sidebar w-64 fixed left-0 top-0 h-full flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt={APP_TITLE} className="w-10 h-10" />
            <h1 className="text-xl font-bold text-shadow">{APP_TITLE}</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <li key={item.path}>
                  <Link href={item.path}>
                    <div
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-all duration-200 cursor-pointer
                        ${isActive 
                          ? 'bg-white/20 text-white font-medium' 
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Usuário"}</p>
              <p className="text-xs text-white/60 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
