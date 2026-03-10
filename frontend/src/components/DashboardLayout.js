import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, BarChart3, Layers, Target, Bell, BookOpen, 
  FileText, User, Settings, LogOut, Menu, X, Users
} from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: Layers, label: 'Collections', path: '/collections' },
    { icon: Target, label: 'Objetivos', path: '/goals' },
    { icon: Bell, label: 'Alertas', path: '/alerts' },
    { icon: BookOpen, label: 'Academia', path: '/academy' },
    { icon: FileText, label: 'Reportes', path: '/reports' },
    { icon: Users, label: 'Referidos', path: '/referrals' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-56 flex-col border-r border-[#1a1a1a] bg-[#0A0A0A] z-40">
        <div className="p-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#8B1538] rounded flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">CIMA</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                location.pathname === item.path
                  ? 'bg-[#8B1538]/10 text-[#8B1538]'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-[#1a1a1a]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                  {user?.picture ? (
                    <img src={user.picture} alt={user.name} className="w-8 h-8" />
                  ) : (
                    <User className="w-4 h-4 text-white/50" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm text-white truncate">{user?.name}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#111111] border-[#1a1a1a]">
              <DropdownMenuItem onClick={() => navigate('/profile')} className="text-white/70 hover:text-white focus:text-white focus:bg-white/5">
                <User className="mr-2 h-4 w-4" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="text-white/70 hover:text-white focus:text-white focus:bg-white/5">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#1a1a1a]" />
              <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-white/5">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#0A0A0A] border-b border-[#1a1a1a] z-50 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#8B1538] rounded flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-semibold text-white">CIMA</span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white/70">
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-14 bg-[#0A0A0A] z-40 p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-md ${
                  location.pathname === item.path
                    ? 'bg-[#8B1538]/10 text-[#8B1538]'
                    : 'text-white/50'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-md text-red-400 w-full"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Cerrar Sesión</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-56 pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
