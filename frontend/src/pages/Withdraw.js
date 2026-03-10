import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, AlertCircle, Building, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Toaster, toast } from 'sonner';

const Withdraw = () => {
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState('');
  const [phone, setPhone] = useState('');
  const [cedula, setCedula] = useState('');

  const handleWithdraw = () => {
    if (!amount || !bank || !phone || !cedula) {
      toast.error('Completa todos los campos');
      return;
    }
    toast.success('Solicitud de retiro enviada. Procesaremos tu pago en las próximas 24 horas.');
  };

  const availableBalance = 10000; // Simulated

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Toaster position="top-center" theme="dark" />
      
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center gap-4">
        <Link to="/dashboard" className="p-2 bg-[#111] rounded-full border border-[#1a1a1a]">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Retirar Fondos</h1>
      </header>

      <main className="px-6 pb-32">
        {/* Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111] rounded-2xl p-6 border border-[#1a1a1a] mb-6"
        >
          <p className="text-xs text-white/40 uppercase font-bold mb-1">Saldo Disponible</p>
          <p className="text-3xl font-bold text-white">
            Bs. {availableBalance.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
          </p>
        </motion.div>

        {/* Warning */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#8B1538]/10 border border-[#8B1538]/20 rounded-xl p-4 flex gap-3 mb-6"
        >
          <AlertCircle className="w-5 h-5 text-[#8B1538] shrink-0 mt-0.5" />
          <p className="text-xs text-white/60 leading-relaxed">
            Los retiros se procesan en días hábiles de 9am a 5pm. El monto mínimo es de Bs. 100.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs text-white/40 uppercase font-bold mb-2 block">Monto a Retirar (Bs.)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1000.00"
              className="bg-[#111] border-[#1a1a1a] text-white placeholder:text-white/20 h-12"
            />
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase font-bold mb-2 block">Banco Destino</label>
            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                type="text"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="Ej: Banesco (0134)"
                className="bg-[#111] border-[#1a1a1a] text-white placeholder:text-white/20 h-12 pl-11"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase font-bold mb-2 block">Teléfono</label>
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0412-1234567"
                className="bg-[#111] border-[#1a1a1a] text-white placeholder:text-white/20 h-12 pl-11"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-white/40 uppercase font-bold mb-2 block">Cédula</label>
            <Input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              placeholder="V-12345678"
              className="bg-[#111] border-[#1a1a1a] text-white placeholder:text-white/20 h-12"
            />
          </div>
        </motion.div>

        {/* Quick Amount Buttons */}
        <div className="flex gap-2 mt-6">
          {[500, 1000, 2500, 5000].map((val) => (
            <button
              key={val}
              onClick={() => setAmount(val.toString())}
              className="flex-1 bg-[#111] border border-[#1a1a1a] rounded-lg py-2 text-sm text-white/60 hover:text-white hover:border-[#8B1538] transition"
            >
              Bs. {val.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleWithdraw}
          className="w-full btn-primary py-4 mt-8"
        >
          Solicitar Retiro
        </Button>
      </main>
    </div>
  );
};

export default Withdraw;
