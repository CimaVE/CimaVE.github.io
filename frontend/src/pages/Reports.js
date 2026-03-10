import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Calendar, TrendingUp, TrendingDown,
  Wallet, Target, Award, BarChart3
} from 'lucide-react';
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
    // Simulate download
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
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white mb-2">
              Reportes
            </h1>
            <p className="text-muted-foreground">
              Resumen mensual de tu actividad de inversión
            </p>
          </div>
          <Button 
            onClick={downloadReport} 
            className="btn-primary-glow"
            disabled={!report}
            data-testid="download-report-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar Reporte
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card h-40 animate-pulse" />
            ))}
          </div>
        ) : report ? (
          <>
            {/* Period Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 mb-8"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Período del Reporte</p>
                  <h2 className="font-heading text-2xl font-bold text-white capitalize">
                    {report.period}
                  </h2>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <p className="text-sm text-muted-foreground">Valor del Portafolio</p>
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <p className="font-heading text-3xl font-bold text-white">
                  ${report.total_value?.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {report.holdings_count} activos en total
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <p className="text-sm text-muted-foreground">Inversión Total</p>
                  <BarChart3 className="w-5 h-5 text-secondary" />
                </div>
                <p className="font-heading text-3xl font-bold text-white">
                  ${report.total_invested?.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Capital invertido
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <p className="text-sm text-muted-foreground">Rendimiento</p>
                  {report.total_return >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-secondary" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <p className={`font-heading text-3xl font-bold ${
                  report.total_return >= 0 ? 'text-secondary' : 'text-destructive'
                }`}>
                  {report.total_return >= 0 ? '+' : ''}${report.total_return?.toLocaleString()}
                </p>
                <p className={`text-sm mt-2 ${
                  report.return_percent >= 0 ? 'text-secondary' : 'text-destructive'
                }`}>
                  {report.return_percent >= 0 ? '+' : ''}{report.return_percent}% del total
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <p className="text-sm text-muted-foreground">Objetivos Activos</p>
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <p className="font-heading text-3xl font-bold text-white">
                  {report.active_goals}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Metas de inversión
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <p className="text-sm text-muted-foreground">Cima Score</p>
                  <Award className="w-5 h-5 text-accent" />
                </div>
                <p className="font-heading text-3xl font-bold text-white">
                  {report.cima_score}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Nivel: {user?.level || 'Start'}
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-card p-6 bg-gradient-to-br from-primary/10 to-secondary/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <p className="text-sm text-muted-foreground">Reporte Fiscal</p>
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <p className="font-heading text-lg font-semibold text-white mb-2">
                  Disponible
                </p>
                <p className="text-sm text-muted-foreground">
                  Historial completo para declaración SENIAT
                </p>
              </motion.div>
            </div>

            {/* Information Note */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass-card p-6"
            >
              <h3 className="font-heading text-lg font-semibold text-white mb-3">
                Acerca de este reporte
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Este reporte incluye un resumen de tu actividad de inversión durante el período indicado. 
                Los datos incluyen el valor total de tu portafolio, rendimientos, metas activas y tu Cima Score. 
                Para la declaración ante el SENIAT, te recomendamos consultar con un asesor fiscal especializado 
                quien podrá interpretar estos datos según tu situación particular.
              </p>
            </motion.div>
          </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center"
          >
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-xl font-semibold text-white mb-2">
              No hay datos disponibles
            </h3>
            <p className="text-muted-foreground">
              Comienza a invertir para generar tu primer reporte mensual.
            </p>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
