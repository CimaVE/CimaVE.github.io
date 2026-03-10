import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, CreditCard, Banknote, ShieldCheck, UserCheck, 
  HelpCircle, LogOut, ChevronRight, Check, Bell, History
} from 'lucide-react';
import BottomNav from '../components/layout/BottomNav';
import { useAuth } from '../contexts/AuthContext';
import { Toaster, toast } from 'sonner';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Sesión cerrada');
  };

  const menuItems = [
    { icon: CreditCard, label: 'Pago Móvil (BCV)', href: '/deposit', active: true },
    { icon: Banknote, label: 'Zelle / Dólares', href: '#', disabled: true },
  ];

  const settingsItems = [
    { icon: ShieldCheck, label: 'Seguridad y 2FA', href: '/security' },
    { icon: UserCheck, label: 'Verificación KYC', href: '/kyc' },
    { icon: Bell, label: 'Notificaciones', href: '/alerts' },
    { icon: History, label: 'Historial', href: '/reports' },
    { icon: HelpCircle, label: 'Centro de Ayuda', href: '/support' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      <Toaster position="top-center" theme="dark" />
      
      {/* Header/Profile Card */}
      <header className="px-6 pt-10 pb-6 text-center">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-full bg-[#111] border-2 border-[#8B1538] flex items-center justify-center text-3xl font-bold text-[#8B1538] mx-auto">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="absolute bottom-0 right-0 bg-[#22C55E] p-1.5 rounded-full border-4 border-[#0A0A0A]">
            <Check className="w-3 h-3 text-black font-bold" />
          </div>
        </div>
        <h1 className="text-xl font-bold">{user?.name || 'Inversionista CIMA'}</h1>
        <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-bold">
          Verificación: Pro
        </p>
        <p className="text-xs text-[#8B1538] mt-2">Cima Score: {user?.cima_score || 0}</p>
      </header>

      <main className="px-6 space-y-6">
        {/* Wallet Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111] rounded-2xl p-6 border border-[#1a1a1a]"
        >
          <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4 px-2">Mi Billetera</h3>
          <div className="space-y-3">
            {menuItems.map((item, i) => (
              <Link
                key={i}
                to={item.disabled ? '#' : item.href}
                className={`flex justify-between items-center p-3 bg-black/20 rounded-xl active:scale-95 transition ${
                  item.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.active ? 'text-[#8B1538]' : 'text-blue-400'}`} />
                  <span className="text-sm">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20" />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Settings Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest px-2 mb-2">Ajustes</h3>
          
          {settingsItems.map((item, i) => (
            <Link
              key={i}
              to={item.href}
              className="w-full flex justify-between items-center p-4 hover:bg-[#111] rounded-xl transition active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <item.icon className="w-5 h-5 text-white/40" />
                <span className="text-sm">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20" />
            </Link>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex justify-between items-center p-4 hover:bg-red-500/10 rounded-xl transition group active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <LogOut className="w-5 h-5 text-red-400" />
              <span className="text-sm text-red-400 font-medium">Cerrar Sesión</span>
            </div>
          </button>
        </motion.div>

        {/* Version Info */}
        <p className="text-center text-xs text-white/20 pt-4">
          CIMA v1.0.0 • Caracas, Venezuela
        </p>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Profile;
