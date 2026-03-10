import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Copy, Upload, Info, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Toaster, toast } from 'sonner';

const Deposit = () => {
  const [copied, setCopied] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);

  const bankData = {
    banco: 'Bancamiga (0172)',
    cedula: 'V-12345678',
    telefono: '0412-5551234'
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileUpload = () => {
    setFileUploaded(true);
    toast.success('Captura cargada con éxito');
  };

  const handleNotifyPayment = () => {
    toast.success('Notificación enviada. Tu saldo se actualizará en breve.');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Toaster position="top-center" theme="dark" />
      
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center gap-4">
        <Link to="/dashboard" className="p-2 bg-[#111] rounded-full border border-[#1a1a1a]">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Cargar Fondos</h1>
      </header>

      <main className="px-6 pb-32">
        {/* Payment Method Tabs */}
        <div className="flex gap-3 mb-8 mt-4">
          <button className="flex-1 bg-[#8B1538] text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-[#8B1538]/20">
            Pago Móvil
          </button>
          <button className="flex-1 bg-[#111] text-white/40 font-bold py-3 rounded-xl text-xs border border-[#1a1a1a] opacity-50">
            Zelle (Próximamente)
          </button>
        </div>

        {/* Bank Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111] rounded-2xl p-6 border border-[#1a1a1a] space-y-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#8B1538]/10 rounded-full flex items-center justify-center text-[#8B1538]">
              <Info className="w-5 h-5" />
            </div>
            <p className="text-xs text-white/50 leading-tight">
              Realiza el pago móvil con los siguientes datos y luego adjunta el comprobante.
            </p>
          </div>

          <div className="space-y-4">
            {/* Banco */}
            <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
              <div>
                <p className="text-[10px] text-white/40 uppercase font-bold">Banco</p>
                <p className="text-sm font-bold text-white">{bankData.banco}</p>
              </div>
              <button 
                onClick={() => copyToClipboard('Bancamiga', 'banco')}
                className="text-[#8B1538] hover:text-[#A01D45] transition"
              >
                {copied === 'banco' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Cédula */}
            <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
              <div>
                <p className="text-[10px] text-white/40 uppercase font-bold">Cédula / RIF</p>
                <p className="text-sm font-bold text-white">{bankData.cedula}</p>
              </div>
              <button 
                onClick={() => copyToClipboard('12345678', 'cedula')}
                className="text-[#8B1538] hover:text-[#A01D45] transition"
              >
                {copied === 'cedula' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Teléfono */}
            <div className="flex justify-between items-center bg-black/20 p-4 rounded-xl border border-white/5">
              <div>
                <p className="text-[10px] text-white/40 uppercase font-bold">Teléfono</p>
                <p className="text-sm font-bold text-white">{bankData.telefono}</p>
              </div>
              <button 
                onClick={() => copyToClipboard('04125551234', 'telefono')}
                className="text-[#8B1538] hover:text-[#A01D45] transition"
              >
                {copied === 'telefono' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Upload Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8"
        >
          <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest mb-4">Confirmación</h3>
          <label className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-10 transition cursor-pointer ${
            fileUploaded 
              ? 'border-[#22C55E] bg-[#22C55E]/5' 
              : 'border-[#1a1a1a] bg-[#111] hover:bg-[#151515]'
          }`}>
            {fileUploaded ? (
              <>
                <Check className="w-10 h-10 text-[#22C55E] mb-2" />
                <span className="text-sm text-[#22C55E] font-medium">Captura cargada</span>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-white/30 mb-2" />
                <span className="text-sm text-white/40 font-medium">Subir captura del pago</span>
              </>
            )}
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
          </label>
        </motion.div>

        {/* Submit Button */}
        <Button 
          onClick={handleNotifyPayment}
          className="w-full btn-primary py-4 mt-8"
          disabled={!fileUploaded}
        >
          Notificar Pago
        </Button>
      </main>
    </div>
  );
};

export default Deposit;
