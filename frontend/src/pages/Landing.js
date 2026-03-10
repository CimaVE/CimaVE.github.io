import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, TrendingUp, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';

const Landing = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-minimal">
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#8B1538] rounded flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-semibold text-white tracking-tight">CIMA</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#producto" className="text-sm text-white/60 hover:text-white transition-colors">Producto</a>
              <a href="#mercados" className="text-sm text-white/60 hover:text-white transition-colors">Mercados</a>
              <a href="#seguridad" className="text-sm text-white/60 hover:text-white transition-colors">Seguridad</a>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" className="text-sm text-white/70 hover:text-white" data-testid="login-nav-btn">
                  Iniciar sesión
                </Button>
              </Link>
              <Link to="/register">
                <Button className="btn-primary text-sm" data-testid="register-nav-btn">
                  Abrir cuenta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center pt-16">
        <div className="page-container">
          <div className="max-w-3xl">
            <motion.div {...fadeIn}>
              <p className="text-[#8B1538] text-sm font-medium tracking-wide uppercase mb-6">
                Inversiones sin complicaciones
              </p>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-white leading-[1.1] tracking-tight mb-6">
                Invierte en el mundo desde Venezuela
              </h1>
              
              <p className="text-lg md:text-xl text-white/50 leading-relaxed mb-10 max-w-xl">
                Accede a acciones internacionales y criptomonedas desde una única plataforma. 
                Sin burocracia. Sin complicaciones.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button className="btn-primary text-base px-8 py-3 h-auto" data-testid="hero-cta-btn">
                    Comenzar ahora
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <a href="#producto">
                  <Button variant="ghost" className="btn-outline text-base px-8 py-3 h-auto">
                    Conocer más
                  </Button>
                </a>
              </div>
            </motion.div>
          </div>
          
          {/* Stats - minimal */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-20 pt-10 border-t border-[#1a1a1a]"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <p className="text-3xl font-semibold text-white">$0</p>
                <p className="text-sm text-white/40 mt-1">Comisión de apertura</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-white">$1</p>
                <p className="text-sm text-white/40 mt-1">Inversión mínima</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-white">15min</p>
                <p className="text-sm text-white/40 mt-1">Tiempo de registro</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-white">24/7</p>
                <p className="text-sm text-white/40 mt-1">Acceso a mercados</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Product Section */}
      <section id="producto" className="section-spacing border-t border-[#1a1a1a]">
        <div className="page-container">
          <div className="max-w-xl mb-16">
            <p className="text-[#8B1538] text-sm font-medium tracking-wide uppercase mb-4">Producto</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
              Todo lo que necesitas para invertir
            </h2>
            <p className="text-white/50">
              Una plataforma diseñada para el inversor venezolano, con herramientas profesionales 
              y educación integrada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Mercados globales",
                description: "Accede a acciones de NASDAQ, NYSE y las principales criptomonedas del mundo."
              },
              {
                title: "Alertas inteligentes",
                description: "Recibe notificaciones cuando tus activos alcancen el precio que defines."
              },
              {
                title: "Academia integrada",
                description: "Aprende a invertir con cursos diseñados para el contexto venezolano."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-minimal p-6"
              >
                <h3 className="text-lg font-medium text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets Section */}
      <section id="mercados" className="section-spacing border-t border-[#1a1a1a]">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#8B1538] text-sm font-medium tracking-wide uppercase mb-4">Mercados</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
                Acciones y criptomonedas en un solo lugar
              </h2>
              <p className="text-white/50 mb-8">
                Invierte en las empresas más grandes del mundo y en las principales criptomonedas, 
                todo desde tu cuenta de Cima.
              </p>
              
              <div className="space-y-4">
                {['Apple', 'Microsoft', 'Tesla', 'Bitcoin', 'Ethereum'].map((asset, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-[#1a1a1a]">
                    <span className="text-white">{asset}</span>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="card-minimal p-8">
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-white/40 mb-1">Valor del portafolio</p>
                  <p className="text-4xl font-semibold text-white">$12,450.00</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#22C55E] text-sm font-medium">+$1,234.56</span>
                  <span className="text-white/40 text-sm">(+11.02%)</span>
                </div>
                <div className="h-32 bg-[#1a1a1a] rounded flex items-end justify-around p-4">
                  {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                    <div key={i} className="w-6 bg-[#8B1538]/60 rounded-t" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="seguridad" className="section-spacing border-t border-[#1a1a1a]">
        <div className="page-container">
          <div className="max-w-xl mx-auto text-center mb-16">
            <p className="text-[#8B1538] text-sm font-medium tracking-wide uppercase mb-4">Seguridad</p>
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
              Tu dinero está protegido
            </h2>
            <p className="text-white/50">
              Custodia regulada internacionalmente y las mejores prácticas de seguridad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="card-minimal p-6 flex gap-4">
              <Shield className="w-5 h-5 text-[#8B1538] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-medium mb-1">Custodia segregada</h3>
                <p className="text-sm text-white/50">Tus activos están separados de los fondos operativos.</p>
              </div>
            </div>
            <div className="card-minimal p-6 flex gap-4">
              <Zap className="w-5 h-5 text-[#8B1538] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-white font-medium mb-1">Encriptación avanzada</h3>
                <p className="text-sm text-white/50">Protección de datos con los más altos estándares.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing border-t border-[#1a1a1a]">
        <div className="page-container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
              Comienza a invertir hoy
            </h2>
            <p className="text-white/50 mb-8">
              Abre tu cuenta en minutos y realiza tu primera inversión.
            </p>
            <Link to="/register">
              <Button className="btn-primary text-base px-10 py-3 h-auto" data-testid="cta-final-btn">
                Abrir cuenta gratis
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#1a1a1a]">
        <div className="page-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#8B1538] rounded flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-medium text-white">CIMA</span>
            </div>
            
            <p className="text-xs text-white/40">
              © 2025 Cima VE. Todos los derechos reservados.
            </p>
            
            <div className="flex items-center gap-6 text-xs text-white/40">
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
