import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Gift, Copy, Check, Share2, DollarSign, UserPlus
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { Toaster, toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';

const Referrals = () => {
  const { api, user } = useAuth();
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [applyCode, setApplyCode] = useState('');

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const response = await api.get('/referrals');
      setReferralData(response.data);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(referralData?.referral_code || '');
    setCopied(true);
    toast.success('Código copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Únete a Cima VE',
          text: `¡Únete a Cima VE y comienza a invertir! Usa mi código de referido: ${referralData?.referral_code} y recibe $5 de regalo.`,
          url: window.location.origin
        });
      } catch (error) {
        copyCode();
      }
    } else {
      copyCode();
    }
  };

  const applyReferralCode = async () => {
    if (!applyCode.trim()) {
      toast.error('Ingresa un código de referido');
      return;
    }

    try {
      await api.post('/referrals/apply', { code: applyCode });
      toast.success('¡Código aplicado! Recibiste $5 de bono');
      setApplyCode('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al aplicar código');
    }
  };

  return (
    <DashboardLayout>
      <Toaster position="top-center" theme="dark" />
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-white mb-2">
            Programa de Referidos
          </h1>
          <p className="text-muted-foreground">
            Invita amigos y gana $5 por cada uno que se registre
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Total Referidos</span>
              </div>
              <p className="font-heading text-3xl font-bold text-white">
                {referralData?.total_referrals || 0}
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-secondary" />
                </div>
                <span className="text-sm text-muted-foreground">Bonos Ganados</span>
              </div>
              <p className="font-heading text-3xl font-bold text-secondary">
                ${referralData?.bonus_earned || 0}
              </p>
            </motion.div>

            {/* Apply Code */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="font-heading font-semibold text-white mb-4">
                ¿Tienes un código?
              </h3>
              <div className="space-y-3">
                <Input
                  value={applyCode}
                  onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
                  placeholder="CIMAXXXXXX"
                  className="bg-white/5 border-white/10"
                  data-testid="apply-code-input"
                />
                <Button 
                  onClick={applyReferralCode}
                  variant="outline" 
                  className="w-full border-white/10"
                  data-testid="apply-code-btn"
                >
                  Aplicar Código
                </Button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Your Code */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 glass-card p-8 bg-gradient-to-br from-primary/10 to-secondary/10"
          >
            <div className="text-center mb-8">
              <Gift className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold text-white mb-2">
                Tu Código de Referido
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Comparte este código con tus amigos. Cuando se registren y hagan su primer depósito, 
                ambos recibirán $5 en acciones fraccionadas.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="px-8 py-4 rounded-xl bg-white/10 border-2 border-dashed border-primary/50">
                <p className="font-heading text-3xl font-bold text-white tracking-widest">
                  {referralData?.referral_code || '------'}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={copyCode}
                className="btn-primary-glow min-w-[160px]"
                data-testid="copy-code-btn"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Código
                  </>
                )}
              </Button>
              <Button 
                onClick={shareCode}
                variant="outline" 
                className="border-white/10 min-w-[160px]"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>

            {/* How it works */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="font-heading text-lg font-semibold text-white text-center mb-6">
                ¿Cómo funciona?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                    <span className="font-heading text-xl font-bold text-primary">1</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Comparte tu código único con amigos y familia
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-3">
                    <span className="font-heading text-xl font-bold text-secondary">2</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ellos se registran y hacen su primer depósito
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
                    <span className="font-heading text-xl font-bold text-accent">3</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ¡Ambos reciben $5 en acciones fraccionadas!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Referrals List */}
        {referralData?.referrals?.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 mt-6"
          >
            <h3 className="font-heading font-semibold text-white mb-4">
              Tus Referidos
            </h3>
            <div className="space-y-3">
              {referralData.referrals.map((referral, index) => (
                <div 
                  key={referral.referral_id}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Referido #{index + 1}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-secondary font-medium">+$5</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Referrals;
