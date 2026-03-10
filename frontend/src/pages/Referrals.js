import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Gift, Copy, Check, Share2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { Toaster, toast } from 'sonner';
import BottomNav from '../components/layout/BottomNav';

const Referrals = () => {
  const { api } = useAuth();
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
    toast.success('Código copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Únete a Cima',
          text: `Invierte con Cima. Usa mi código: ${referralData?.referral_code} y recibe $5.`,
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
      toast.error('Ingresa un código');
      return;
    }
    try {
      await api.post('/referrals/apply', { code: applyCode });
      toast.success('Código aplicado: +$5');
      setApplyCode('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Código inválido');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      <Toaster position="top-center" theme="dark" />
      <div className="px-5 pt-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-white">Referidos</h1>
          <p className="text-sm text-white/40 mt-1">Invita amigos y gana $5 por cada uno</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card-minimal p-5">
            <p className="text-xs text-white/40 mb-1">Referidos</p>
            <p className="text-2xl font-semibold text-white">{referralData?.total_referrals || 0}</p>
          </div>
          <div className="card-minimal p-5">
            <p className="text-xs text-white/40 mb-1">Ganado</p>
            <p className="text-2xl font-semibold text-[#22C55E]">${referralData?.bonus_earned || 0}</p>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-minimal p-6 mb-6">
          <div className="text-center mb-6">
            <Gift className="w-10 h-10 text-[#8B1538] mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-white mb-1">Tu código</h2>
            <p className="text-sm text-white/40">Compártelo con amigos</p>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="px-6 py-3 rounded bg-[#1a1a1a] border border-dashed border-[#333]">
              <p className="text-2xl font-semibold text-white tracking-widest">{referralData?.referral_code || '------'}</p>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <Button onClick={copyCode} className="btn-primary text-sm" data-testid="copy-code-btn">
              {copied ? <><Check className="w-4 h-4 mr-2" />Copiado</> : <><Copy className="w-4 h-4 mr-2" />Copiar</>}
            </Button>
            <Button onClick={shareCode} variant="outline" className="text-sm bg-transparent border-[#252525] hover:bg-white/5 text-white/70">
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-minimal p-5">
          <h3 className="text-sm font-medium text-white mb-3">¿Tienes un código?</h3>
          <div className="flex gap-2">
            <Input
              value={applyCode}
              onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
              placeholder="CIMAXXXXXX"
              className="bg-[#0A0A0A] border-[#1a1a1a] text-white placeholder:text-white/30"
              data-testid="apply-code-input"
            />
            <Button onClick={applyReferralCode} variant="outline" className="text-sm bg-transparent border-[#252525] hover:bg-white/5 text-white/70" data-testid="apply-code-btn">
              Aplicar
            </Button>
          </div>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Referrals;
