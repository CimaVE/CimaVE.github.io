import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, GraduationCap, User, ArrowLeftRight } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Inicio', path: '/dashboard' },
  { icon: BarChart2, label: 'Mercado', path: '/collections' },
  { icon: GraduationCap, label: 'Aprende', path: '/academy' },
  { icon: User, label: 'Perfil', path: '/profile' },
];

const BottomNav = ({ onTradeClick }) => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 w-full bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-[#1a1a1a] px-2 pb-6 pt-3 flex justify-around items-center z-50" data-testid="bottom-nav">
      {navItems.slice(0, 2).map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center gap-1 w-16 transition ${
            location.pathname === item.path ? 'text-[#8B1538]' : 'text-white/40 hover:text-white'
          }`}
          data-testid={`nav-${item.label.toLowerCase()}`}
        >
          <item.icon className="w-6 h-6" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}

      {/* Center Trade Button */}
      <div className="relative -top-6">
        {onTradeClick ? (
          <button
            onClick={onTradeClick}
            className="bg-[#8B1538] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-[5px] border-[#0A0A0A] active:scale-90 transition transform"
            data-testid="trade-button"
          >
            <ArrowLeftRight className="w-8 h-8" />
          </button>
        ) : (
          <Link
            to="/dashboard"
            className="bg-[#8B1538] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-[5px] border-[#0A0A0A] active:scale-90 transition transform"
            data-testid="trade-button"
          >
            <ArrowLeftRight className="w-8 h-8" />
          </Link>
        )}
      </div>

      {navItems.slice(2).map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex flex-col items-center gap-1 w-16 transition ${
            location.pathname === item.path ? 'text-[#8B1538]' : 'text-white/40 hover:text-white'
          }`}
          data-testid={`nav-${item.label.toLowerCase()}`}
        >
          <item.icon className="w-6 h-6" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;
