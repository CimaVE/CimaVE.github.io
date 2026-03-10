import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { Toaster, toast } from 'sonner';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name);
      toast.success('Cuenta creada exitosamente');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <Toaster position="top-center" theme="dark" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-[#8B1538] rounded flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">CIMA</span>
        </Link>

        <h1 className="text-2xl font-semibold text-white mb-2">
          Crear cuenta
        </h1>
        <p className="text-white/50 text-sm mb-8">
          Tu primera inversión en minutos
        </p>

        {/* Google Register */}
        <Button 
          variant="outline" 
          className="w-full mb-6 h-11 bg-transparent border-[#252525] hover:bg-white/5 hover:border-[#333] text-white"
          onClick={loginWithGoogle}
          data-testid="google-register-btn"
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Registrarse con Google
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#1a1a1a]"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-[#0A0A0A] text-white/40">o</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-white/50 mb-2 block">Nombre completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="pl-10 h-11 bg-[#111111] border-[#1a1a1a] focus:border-[#8B1538] text-white placeholder:text-white/30"
                required
                data-testid="name-input"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/50 mb-2 block">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="pl-10 h-11 bg-[#111111] border-[#1a1a1a] focus:border-[#8B1538] text-white placeholder:text-white/30"
                required
                data-testid="email-input"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/50 mb-2 block">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="pl-10 pr-10 h-11 bg-[#111111] border-[#1a1a1a] focus:border-[#8B1538] text-white placeholder:text-white/30"
                required
                data-testid="password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-11 btn-primary"
            disabled={loading}
            data-testid="register-submit-btn"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </form>

        <p className="text-xs text-white/30 mt-6 text-center leading-relaxed">
          Al registrarte, aceptas los{' '}
          <a href="#" className="text-white/50 hover:text-white">Términos</a>
          {' '}y{' '}
          <a href="#" className="text-white/50 hover:text-white">Privacidad</a>
        </p>

        <p className="text-center text-white/40 text-sm mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-[#8B1538] hover:text-[#A01D45]">
            Iniciar sesión
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
