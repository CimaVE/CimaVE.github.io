import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Shield, Smartphone, Key, Eye, EyeOff, Lock, Fingerprint } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Toaster, toast } from 'sonner';

const Security = () => {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleToggle2FA = (checked) => {
    setTwoFAEnabled(checked);
    toast.success(checked ? '2FA activado' : '2FA desactivado');
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) {
      toast.error('Completa todos los campos');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    toast.success('Contraseña actualizada correctamente');
    setCurrentPassword('');
    setNewPassword('');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      <Toaster position="top-center" theme="dark" />

      <header className="px-6 pt-8 pb-4 flex items-center gap-4">
        <Link to="/profile" className="p-2 bg-[#111] rounded-full border border-[#1a1a1a]" data-testid="security-back-btn">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Seguridad</h1>
      </header>

      <main className="px-6 space-y-6">
        {/* 2FA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111] rounded-2xl p-6 border border-[#1a1a1a]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#8B1538]/10 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#8B1538]" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Autenticación de Dos Factores</h3>
              <p className="text-xs text-white/40">Protege tu cuenta con un paso extra</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-black/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-white/40" />
                <div>
                  <p className="text-sm">SMS / Authenticator</p>
                  <p className="text-xs text-white/40">Código de verificación al iniciar sesión</p>
                </div>
              </div>
              <Switch checked={twoFAEnabled} onCheckedChange={handleToggle2FA} data-testid="2fa-toggle" />
            </div>

            <div className="flex justify-between items-center p-4 bg-black/20 rounded-xl">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-white/40" />
                <div>
                  <p className="text-sm">Biométrico</p>
                  <p className="text-xs text-white/40">Huella o Face ID</p>
                </div>
              </div>
              <Switch checked={biometricEnabled} onCheckedChange={setBiometricEnabled} data-testid="biometric-toggle" />
            </div>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#111] rounded-2xl p-6 border border-[#1a1a1a]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#8B1538]/10 rounded-full flex items-center justify-center">
              <Key className="w-5 h-5 text-[#8B1538]" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Cambiar Contraseña</h3>
              <p className="text-xs text-white/40">Actualiza tu contraseña periódicamente</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/40 uppercase font-bold mb-2 block">Contraseña Actual</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="********"
                  className="bg-black/20 border-[#1a1a1a] text-white placeholder:text-white/20 h-12 pl-11 pr-11"
                  data-testid="current-password-input"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase font-bold mb-2 block">Nueva Contraseña</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="bg-black/20 border-[#1a1a1a] text-white placeholder:text-white/20 h-12"
                data-testid="new-password-input"
              />
            </div>

            <Button onClick={handleChangePassword} className="w-full btn-primary" data-testid="change-password-btn">
              Actualizar Contraseña
            </Button>
          </div>
        </motion.div>

        {/* Active Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#111] rounded-2xl p-6 border border-[#1a1a1a]"
        >
          <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Sesiones Activas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-[#22C55E]/20">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#22C55E]"></div>
                <div>
                  <p className="text-sm">Dispositivo actual</p>
                  <p className="text-xs text-white/40">Navegador web</p>
                </div>
              </div>
              <span className="text-xs text-[#22C55E]">Activa</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Security;
