import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Calendar, TrendingUp, TrendingDown, Wallet, Target } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';

const Reports = () => {
  const { api, user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const response = await api.get('/reports/monthly');
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const reportData = JSON.stringify(report, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cima_report_${new Date().toISOString().slice(0, 7)}.json`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-white">Reportes</h1>
            <p className="text-sm text-white/40 mt-1">Resumen mensual de tu actividad</p>
          </div>
          <Button onClick={downloadReport} className="btn-primary text-sm" disabled={!report} data-testid="download-report-btn">
            <Download className="w-4 h-4 mr-2" />
            Descargar
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="card-minimal h-28 animate-pulse" />)}
          </div>
        ) : report ? (
          <>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-minimal p-5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#8B1538]/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#8B1538]" />
                </div>
                <div>
                  <p className="text-xs text-white/40">Período</p>
                  <p className="text-lg font-semibold text-white capitalize">{report.period}</p>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card-minimal p-5">
                <p className="text-xs text-white/40 mb-1">Valor del portafolio</p>
                <p className="text-2xl font-semibold text-white">${report.total_value?.toLocaleString()}</p>
                <p className="text-xs text-white/30 mt-1">{report.holdings_count} activos</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-minimal p-5">
                <p className="text-xs text-white/40 mb-1">Invertido</p>
                <p className="text-2xl font-semibold text-white">${report.total_invested?.toLocaleString()}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card-minimal p-5">
                <p className="text-xs text-white/40 mb-1">Rendimiento</p>
                <p className={`text-2xl font-semibold ${report.total_return >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                  {report.total_return >= 0 ? '+' : ''}${report.total_return?.toLocaleString()}
                </p>
                <p className={`text-xs mt-1 ${report.return_percent >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                  {report.return_percent >= 0 ? '+' : ''}{report.return_percent}%
                </p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-minimal p-5">
                <p className="text-xs text-white/40 mb-1">Objetivos</p>
                <p className="text-2xl font-semibold text-white">{report.active_goals}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card-minimal p-5">
                <p className="text-xs text-white/40 mb-1">Cima Score</p>
                <p className="text-2xl font-semibold text-white">{report.cima_score}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-minimal p-5">
                <p className="text-xs text-white/40 mb-1">Reporte fiscal</p>
                <p className="text-sm text-white">Disponible</p>
                <p className="text-xs text-white/30 mt-1">Para SENIAT</p>
              </motion.div>
            </div>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-minimal p-12 text-center">
            <FileText className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <h3 className="text-base font-medium text-white mb-1">Sin datos</h3>
            <p className="text-sm text-white/40">Comienza a invertir para generar tu primer reporte.</p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
