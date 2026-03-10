import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, TrendingUp, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';

const Landing = () => {
  const [bcvRate, setBcvRate] = useState(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchBCV();
    const interval = setInterval(fetchBCV, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchBCV = async () => {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();
      setBcvRate(data.rates.VES);
    } catch (error) {
      console.error('Error fetching BCV rate:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#8B1538] rounded flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-semibold text-white tracking-tight">CIMA</span>
            </Link>
            
            {/* BCV Rate - Live indicator */}
            <div className="hidden md:flex items-center gap-2 bg-[#111] px-4 py-2 rounded-full border border-[#1a1a1a]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
              </span>
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">USD/BCV</span>
              <span className="font-mono text-[#22C55E] font-bold text-sm">
                {bcvRate ? `Bs. ${bcvRate.toLocaleString('es-VE', { minimumFractionDigits: 2 })}` : '...'}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/academy" className="hidden sm:flex items-center gap-2 text-white/50 hover:text-white text-sm">
                Aprende
              </Link>
              <Link to="/login">
                <Button variant="ghost" className="text-sm text-white/70 hover:text-white">
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button className="btn-primary text-sm" data-testid="register-nav-btn">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center pt-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-block bg-[#111] rounded-full px-4 py-1.5 text-[10px] font-bold text-[#8B1538] mb-6 border border-[#8B1538]/20 uppercase tracking-widest">
              🚀 Próximamente en Venezuela
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight mb-6">
              Lleva tu dinero a la <br/>
              <span className="text-[#8B1538]">CIMA Financiera</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              La primera plataforma pensada para jóvenes inversionistas. Accede a la{' '}
              <strong className="text-white">Bolsa de Valores de Caracas</strong> y mercados globales desde tu teléfono.
              Rápido, seguro y sin montos mínimos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                className="flex-1 bg-[#111] border border-[#1a1a1a] rounded-xl px-5 py-4 text-white focus:outline-none focus:border-[#8B1538] transition"
              />
              <Button className="btn-primary py-4 px-8 text-base" data-testid="hero-cta-btn">
                Unirme
              </Button>
            </div>
          </motion.div>
        </div>

        {/* TradingView Chart Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="w-full max-w-5xl mx-auto mt-16 bg-[#111] p-1 rounded-2xl border border-[#1a1a1a] overflow-hidden relative"
        >
          <div className="absolute top-4 left-4 z-10 bg-[#0A0A0A]/90 backdrop-blur px-3 py-1.5 rounded-full border border-[#1a1a1a] flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
            </span>
            <span className="text-[10px] text-white/60 font-bold uppercase tracking-tighter">Mercado en Vivo</span>
          </div>
          <div className="h-[400px] w-full">
            <iframe 
              src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=SP%3ASPX&interval=D&theme=dark&style=3&locale=es&toolbar_bg=%230A0A0A&enable_publishing=false&hide_top_toolbar=false&backgroundColor=rgba(10%2C%2010%2C%2010%2C%201)&gridColor=rgba(26%2C%2026%2C%2026%2C%201)"
              className="w-full h-full rounded-xl"
              frameBorder="0"
              allowTransparency={true}
              scrolling="no"
            />
          </div>
        </motion.div>
        
        <p className="text-[10px] text-white/30 mt-6 uppercase tracking-widest font-bold">
          🔒 Tus datos están protegidos bajo encriptación CIMA
        </p>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '⚡',
                title: 'Velocidad',
                description: 'Ejecuta órdenes en milisegundos. Diseñado para la inmediatez de la nueva generación.'
              },
              {
                icon: '🛡️',
                title: 'Seguridad',
                description: 'Encriptación de grado militar y autenticación biométrica para proteger tus activos.'
              },
              {
                icon: '🇻🇪',
                title: 'Venezuela',
                description: 'Conectados con la banca nacional para facilitar tus depósitos y retiros en Bolívares.'
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#111] p-8 rounded-2xl border border-[#1a1a1a] hover:border-[#8B1538]/30 transition group"
              >
                <div className="w-12 h-12 bg-[#8B1538]/10 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets Preview */}
      <section className="py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#8B1538] text-sm font-medium uppercase tracking-wide mb-4">Mercados</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
                Acciones y criptomonedas en un solo lugar
              </h2>
              <p className="text-white/50 mb-8">
                Invierte en las empresas más grandes del mundo y en las principales criptomonedas, 
                todo desde tu cuenta de Cima.
              </p>
              
              <div className="space-y-3">
                {[
                  { name: 'NVIDIA', ticker: 'NVDA', price: 726.13, change: 4.50 },
                  { name: 'Apple', ticker: 'AAPL', price: 178.50, change: 1.20 },
                  { name: 'Bitcoin', ticker: 'BTC', price: 67432, change: 2.34 },
                  { name: 'Tesla', ticker: 'TSLA', price: 245.60, change: -1.80 },
                ].map((asset, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-[#1a1a1a]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-white/40 w-12">{asset.ticker}</span>
                      <span className="text-white">{asset.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-medium">${asset.price.toLocaleString()}</span>
                      <span className={`ml-2 text-sm ${asset.change >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                        {asset.change >= 0 ? '+' : ''}{asset.change}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-[#111] p-8 rounded-2xl border border-[#1a1a1a]">
              <div className="mb-6">
                <p className="text-sm text-white/40 mb-1">Patrimonio Total</p>
                <p className="text-4xl font-bold text-white">$12,450.00</p>
              </div>
              <div className="flex items-center gap-2 mb-8">
                <span className="text-[#22C55E] text-sm font-medium">+$1,234.56</span>
                <span className="text-white/40 text-sm">(+11.02%)</span>
              </div>
              <div className="h-32 bg-[#1a1a1a] rounded-lg flex items-end justify-around p-4">
                {[40, 65, 45, 80, 55, 70, 90, 75, 85].map((h, i) => (
                  <div key={i} className="w-5 bg-[#8B1538]/60 rounded-t transition-all hover:bg-[#8B1538]" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
            Comienza a invertir hoy
          </h2>
          <p className="text-white/50 mb-8">
            Abre tu cuenta en minutos y realiza tu primera inversión.
          </p>
          <Link to="/register">
            <Button className="btn-primary text-base px-10 py-3" data-testid="cta-final-btn">
              Abrir cuenta gratis
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <div className="w-6 h-6 bg-[#8B1538] rounded flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-white font-bold">CIMA</span>
            </div>
            <p className="text-xs text-white/40">© 2026 CIMA Financial Technologies.<br/>Caracas, Venezuela.</p>
          </div>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 bg-[#111] border border-[#1a1a1a] rounded-full flex items-center justify-center text-white/50 hover:text-white hover:border-[#8B1538] transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/></svg>
            </a>
            <a href="#" className="w-10 h-10 bg-[#111] border border-[#1a1a1a] rounded-full flex items-center justify-center text-white/50 hover:text-white hover:border-[#8B1538] transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
