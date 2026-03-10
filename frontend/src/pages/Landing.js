import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Shield, Zap, BookOpen, Target, Bell, 
  Users, BarChart3, ArrowRight, ChevronRight, Globe,
  Smartphone, Lock, Award, Star
} from 'lucide-react';
import { Button } from '../components/ui/button';

const Landing = () => {
  const [email, setEmail] = useState('');

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
  };

  const features = [
    {
      icon: Globe,
      title: "Mercados Globales",
      description: "Accede a la Bolsa de Caracas y al NASDAQ desde una sola plataforma"
    },
    {
      icon: Shield,
      title: "Seguridad Institucional",
      description: "Activos protegidos con custodia regulada internacionalmente"
    },
    {
      icon: Zap,
      title: "15 Minutos",
      description: "De apertura de cuenta a primera inversión, sin burocracia"
    },
    {
      icon: BookOpen,
      title: "Academia Integrada",
      description: "Aprende antes de invertir con cursos diseñados para ti"
    }
  ];

  const stats = [
    { value: "$0", label: "Comisión de apertura" },
    { value: "$1", label: "Inversión mínima" },
    { value: "15min", label: "Tiempo de registro" },
    { value: "24/7", label: "Acceso a mercados" }
  ];

  return (
    <div className="min-h-screen bg-[#02040A]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading text-xl font-bold text-white">CIMA<span className="text-primary">VE</span></span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-white transition-colors">Características</a>
              <a href="#collections" className="text-sm text-muted-foreground hover:text-white transition-colors">Colecciones</a>
              <a href="#academy" className="text-sm text-muted-foreground hover:text-white transition-colors">Academia</a>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-sm" data-testid="login-nav-btn">Iniciar Sesión</Button>
              </Link>
              <Link to="/register">
                <Button className="btn-primary-glow text-sm" data-testid="register-nav-btn">Comenzar Gratis</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1724711603891-ca4557b9f40f" 
            alt="Caracas skyline"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 hero-gradient" />
        </div>

        <div className="relative z-10 page-container text-center py-20">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm">
                <Star className="w-4 h-4" />
                La plataforma #1 de inversiones en Venezuela
              </span>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="font-heading text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-none"
            >
              Invierte en el mundo
              <br />
              <span className="gradient-text">desde Venezuela</span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              Accede a la Bolsa de Caracas y a los principales mercados internacionales 
              desde una única plataforma. Tu primera inversión en 15 minutos.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/register">
                <Button className="btn-primary-glow text-lg px-8 py-6 h-auto" data-testid="hero-cta-btn">
                  Comenzar a Invertir
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" className="text-lg px-8 py-6 h-auto border-white/10 hover:bg-white/5">
                  Conoce más
                </Button>
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="font-heading text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
            <motion.div 
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="page-container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
              Todo lo que necesitas para invertir
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Una plataforma diseñada para el inversor venezolano, con herramientas profesionales y educación integrada.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 group hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Collections Preview */}
      <section id="collections" className="py-24 bg-[#0B0E14]/50">
        <div className="page-container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center gap-16"
          >
            <div className="flex-1">
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Cima Collections</span>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
                Invierte por temas, no por acciones
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                En lugar de elegir acciones individuales, invierte en colecciones temáticas curadas por expertos. 
                Tecnología, energía verde, criptomonedas y más.
              </p>
              <div className="space-y-4">
                {['Tecnología que usas todos los días', 'El futuro es verde', 'Cripto Blue Chips'].map((name, i) => (
                  <div key={i} className="flex items-center gap-3 text-muted-foreground">
                    <ChevronRight className="w-5 h-5 text-primary" />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
              <Link to="/register" className="inline-block mt-8">
                <Button className="btn-primary-glow">
                  Explorar Colecciones
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            <div className="flex-1 relative">
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="glass-card overflow-hidden aspect-square"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1616441064539-b4fceed1f01f" 
                    alt="Technology"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="glass-card overflow-hidden aspect-square mt-8"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1629816817266-fab9177f675d" 
                    alt="Crypto"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Academy Section */}
      <section id="academy" className="py-24">
        <div className="page-container">
          <div className="glass-card p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
            <div className="relative z-10">
              <BookOpen className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
                Academia Cima VE
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Aprende a invertir con cursos diseñados para el contexto venezolano. 
                Desde fundamentos hasta estrategias avanzadas, certificaciones incluidas.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5">
                  <Award className="w-4 h-4 text-accent" />
                  <span className="text-sm">Certificaciones oficiales</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5">
                  <Users className="w-4 h-4 text-accent" />
                  <span className="text-sm">Comunidad activa</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5">
                  <Target className="w-4 h-4 text-accent" />
                  <span className="text-sm">Aprendizaje práctico</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1758691737387-a89bb8adf768" 
            alt="Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#02040A] via-[#02040A]/80 to-[#02040A]" />
        </div>
        
        <div className="page-container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6">
              Tu primera inversión<br />en 15 minutos
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Únete a miles de venezolanos que ya están construyendo su futuro financiero con Cima VE.
            </p>
            <Link to="/register">
              <Button className="btn-primary-glow text-lg px-10 py-6 h-auto" data-testid="cta-final-btn">
                Crear mi cuenta gratis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="page-container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="font-heading text-xl font-bold text-white">CIMA<span className="text-primary">VE</span></span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2025 Cima VE. Todos los derechos reservados.
            </p>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
