import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, UserCheck, Upload, Camera, FileText,
  Check, Clock, AlertCircle, ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Toaster, toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

const KYC = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    cedula: '',
    dateOfBirth: '',
    address: '',
    city: 'Caracas',
    phone: '',
  });
  const [idFront, setIdFront] = useState(false);
  const [idBack, setIdBack] = useState(false);
  const [selfie, setSelfie] = useState(false);

  const steps = [
    { title: 'Datos Personales', icon: FileText },
    { title: 'Documento de Identidad', icon: Camera },
    { title: 'Verificación Facial', icon: UserCheck },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (step === 0) {
      if (!formData.fullName || !formData.cedula || !formData.phone) {
        toast.error('Completa los campos obligatorios');
        return;
      }
    }
    if (step === 1) {
      if (!idFront || !idBack) {
        toast.error('Sube ambas fotos de tu cédula');
        return;
      }
    }
    if (step < 2) {
      setStep(step + 1);
    } else {
      toast.success('Verificación enviada. Te notificaremos en 24-48 horas.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-24">
      <Toaster position="top-center" theme="dark" />

      <header className="px-6 pt-8 pb-4 flex items-center gap-4">
        <Link to="/profile" className="p-2 bg-[#111] rounded-full border border-[#1a1a1a]" data-testid="kyc-back-btn">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Verificación KYC</h1>
      </header>

      <main className="px-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 mt-4">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition ${
                i < step ? 'bg-[#22C55E] text-black' :
                i === step ? 'bg-[#8B1538] text-white' :
                'bg-[#111] text-white/30 border border-[#1a1a1a]'
              }`}>
                {i < step ? <Check className="w-5 h-5" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 sm:w-20 h-0.5 mx-1 ${i < step ? 'bg-[#22C55E]' : 'bg-[#1a1a1a]'}`} />
              )}
            </div>
          ))}
        </div>

        <p className="text-sm text-white/40 mb-6">
          Paso {step + 1} de 3: <span className="text-white font-medium">{steps[step].title}</span>
        </p>

        {/* Step 0: Personal Data */}
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="text-xs text-white/40 uppercase font-bold mb-2 block">Nombre Completo *</label>
              <Input
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Juan Pérez"
                className="bg-[#111] border-[#1a1a1a] text-white placeholder:text-white/20 h-12"
                data-testid="kyc-fullname-input"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase font-bold mb-2 block">Cédula de Identidad *</label>
              <Input
                value={formData.cedula}
                onChange={(e) => handleInputChange('cedula', e.target.value)}
                placeholder="V-12345678"
                className="bg-[#111] border-[#1a1a1a] text-white placeholder:text-white/20 h-12"
                data-testid="kyc-cedula-input"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase font-bold mb-2 block">Fecha de Nacimiento</label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="bg-[#111] border-[#1a1a1a] text-white h-12"
                data-testid="kyc-dob-input"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase font-bold mb-2 block">Teléfono *</label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="0412-1234567"
                className="bg-[#111] border-[#1a1a1a] text-white placeholder:text-white/20 h-12"
                data-testid="kyc-phone-input"
              />
            </div>
            <div>
              <label className="text-xs text-white/40 uppercase font-bold mb-2 block">Dirección</label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Tu dirección"
                className="bg-[#111] border-[#1a1a1a] text-white placeholder:text-white/20 h-12"
                data-testid="kyc-address-input"
              />
            </div>
          </motion.div>
        )}

        {/* Step 1: Document Upload */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-[#8B1538]/10 border border-[#8B1538]/20 rounded-xl p-4 flex gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-[#8B1538] shrink-0 mt-0.5" />
              <p className="text-xs text-white/60 leading-relaxed">
                Sube fotos claras de tu cédula de identidad. Asegúrate de que todos los datos sean legibles.
              </p>
            </div>

            <label className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-10 transition cursor-pointer ${
              idFront ? 'border-[#22C55E] bg-[#22C55E]/5' : 'border-[#1a1a1a] bg-[#111] hover:bg-[#151515]'
            }`}>
              {idFront ? (
                <>
                  <Check className="w-10 h-10 text-[#22C55E] mb-2" />
                  <span className="text-sm text-[#22C55E] font-medium">Frente cargado</span>
                </>
              ) : (
                <>
                  <Camera className="w-10 h-10 text-white/30 mb-2" />
                  <span className="text-sm text-white/40 font-medium">Foto frontal de la cédula</span>
                </>
              )}
              <input type="file" className="hidden" onChange={() => setIdFront(true)} accept="image/*" data-testid="kyc-id-front" />
            </label>

            <label className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-10 transition cursor-pointer ${
              idBack ? 'border-[#22C55E] bg-[#22C55E]/5' : 'border-[#1a1a1a] bg-[#111] hover:bg-[#151515]'
            }`}>
              {idBack ? (
                <>
                  <Check className="w-10 h-10 text-[#22C55E] mb-2" />
                  <span className="text-sm text-[#22C55E] font-medium">Reverso cargado</span>
                </>
              ) : (
                <>
                  <Camera className="w-10 h-10 text-white/30 mb-2" />
                  <span className="text-sm text-white/40 font-medium">Foto reverso de la cédula</span>
                </>
              )}
              <input type="file" className="hidden" onChange={() => setIdBack(true)} accept="image/*" data-testid="kyc-id-back" />
            </label>
          </motion.div>
        )}

        {/* Step 2: Selfie Verification */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-[#111] rounded-2xl p-6 border border-[#1a1a1a] text-center">
              <UserCheck className="w-16 h-16 text-[#8B1538] mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Selfie de verificación</h3>
              <p className="text-sm text-white/40 mb-6">
                Tómate una selfie sosteniendo tu cédula junto a tu rostro. Asegúrate de buena iluminación.
              </p>

              <label className={`w-full flex flex-col items-center justify-center border-2 border-dashed rounded-2xl py-10 transition cursor-pointer ${
                selfie ? 'border-[#22C55E] bg-[#22C55E]/5' : 'border-[#1a1a1a] bg-[#0A0A0A] hover:bg-[#151515]'
              }`}>
                {selfie ? (
                  <>
                    <Check className="w-10 h-10 text-[#22C55E] mb-2" />
                    <span className="text-sm text-[#22C55E] font-medium">Selfie cargada</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-10 h-10 text-white/30 mb-2" />
                    <span className="text-sm text-white/40 font-medium">Tomar / Subir selfie</span>
                  </>
                )}
                <input type="file" className="hidden" onChange={() => setSelfie(true)} accept="image/*" capture="user" data-testid="kyc-selfie" />
              </label>
            </div>
          </motion.div>
        )}

        {/* Next Button */}
        <Button
          onClick={handleNextStep}
          className="w-full btn-primary py-4 mt-8"
          data-testid="kyc-next-btn"
        >
          {step === 2 ? 'Enviar Verificación' : 'Continuar'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>

        {/* Status Info */}
        <div className="mt-6 flex items-center gap-2 justify-center">
          <Clock className="w-4 h-4 text-white/30" />
          <p className="text-xs text-white/30">Tiempo de verificación: 24-48 horas</p>
        </div>
      </main>
    </div>
  );
};

export default KYC;
