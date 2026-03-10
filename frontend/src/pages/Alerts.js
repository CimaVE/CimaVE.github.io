import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Plus, Trash2, TrendingUp, TrendingDown, 
  ArrowUpRight, ArrowDownRight, Activity, Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { Toaster, toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const Alerts = () => {
  const { api } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [cryptos, setCryptos] = useState([]);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    alert_type: 'price_above',
    threshold: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [alertsRes, stocksRes, cryptoRes] = await Promise.all([
        api.get('/alerts'),
        api.get('/market/stocks'),
        api.get('/market/crypto')
      ]);
      setAlerts(alertsRes.data.alerts || []);
      setStocks(stocksRes.data.stocks || []);
      setCryptos(cryptoRes.data.cryptocurrencies || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async () => {
    if (!newAlert.symbol || !newAlert.threshold) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    try {
      await api.post('/alerts', {
        ...newAlert,
        threshold: parseFloat(newAlert.threshold)
      });
      toast.success('Alerta creada exitosamente');
      setDialogOpen(false);
      setNewAlert({ symbol: '', alert_type: 'price_above', threshold: '' });
      fetchData();
    } catch (error) {
      toast.error('Error al crear la alerta');
    }
  };

  const deleteAlert = async (alertId) => {
    try {
      await api.delete(`/alerts/${alertId}`);
      toast.success('Alerta eliminada');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar la alerta');
    }
  };

  const allAssets = [
    ...stocks.map(s => ({ symbol: s.symbol, name: s.name, price: s.price, type: 'stock' })),
    ...cryptos.map(c => ({ symbol: c.symbol, name: c.name, price: c.price, type: 'crypto' }))
  ];

  const getAssetPrice = (symbol) => {
    const stock = stocks.find(s => s.symbol === symbol);
    if (stock) return stock.price;
    const crypto = cryptos.find(c => c.symbol === symbol);
    if (crypto) return crypto.price;
    return null;
  };

  return (
    <DashboardLayout>
      <Toaster position="top-center" theme="dark" />
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Zap className="w-8 h-8 text-primary" />
              Cima Pulse
            </h1>
            <p className="text-muted-foreground">
              Alertas inteligentes personalizadas según tu portafolio
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary-glow" data-testid="create-alert-btn">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Alerta
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0B0E14] border-white/10">
              <DialogHeader>
                <DialogTitle className="font-heading text-xl text-white">Crear Alerta de Precio</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Activo</label>
                  <Select 
                    value={newAlert.symbol} 
                    onValueChange={(value) => setNewAlert({ ...newAlert, symbol: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Selecciona un activo" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0B0E14] border-white/10 max-h-60">
                      <div className="px-2 py-1 text-xs text-muted-foreground">Acciones</div>
                      {stocks.map((stock) => (
                        <SelectItem key={stock.symbol} value={stock.symbol}>
                          {stock.symbol} - {stock.name}
                        </SelectItem>
                      ))}
                      <div className="px-2 py-1 text-xs text-muted-foreground mt-2">Criptomonedas</div>
                      {cryptos.map((crypto) => (
                        <SelectItem key={crypto.symbol} value={crypto.symbol}>
                          {crypto.symbol} - {crypto.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Tipo de Alerta</label>
                  <Select 
                    value={newAlert.alert_type} 
                    onValueChange={(value) => setNewAlert({ ...newAlert, alert_type: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0B0E14] border-white/10">
                      <SelectItem value="price_above">
                        <span className="flex items-center gap-2">
                          <ArrowUpRight className="w-4 h-4 text-secondary" />
                          Precio sube por encima de
                        </span>
                      </SelectItem>
                      <SelectItem value="price_below">
                        <span className="flex items-center gap-2">
                          <ArrowDownRight className="w-4 h-4 text-destructive" />
                          Precio baja por debajo de
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Precio Umbral (USD)</label>
                  <Input
                    type="number"
                    value={newAlert.threshold}
                    onChange={(e) => setNewAlert({ ...newAlert, threshold: e.target.value })}
                    placeholder="Ej: 150.00"
                    className="bg-white/5 border-white/10"
                    data-testid="alert-threshold-input"
                  />
                </div>
                <Button onClick={createAlert} className="w-full btn-primary-glow" data-testid="submit-alert-btn">
                  Crear Alerta
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Alertas Activas</span>
            </div>
            <p className="font-heading text-3xl font-bold text-white">
              {alerts.filter(a => a.is_active).length}
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
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-sm text-muted-foreground">Alertas Alcistas</span>
            </div>
            <p className="font-heading text-3xl font-bold text-white">
              {alerts.filter(a => a.alert_type === 'price_above').length}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <span className="text-sm text-muted-foreground">Alertas Bajistas</span>
            </div>
            <p className="font-heading text-3xl font-bold text-white">
              {alerts.filter(a => a.alert_type === 'price_below').length}
            </p>
          </motion.div>
        </div>

        {/* Alerts List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-24 animate-pulse" />
            ))}
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert, index) => {
              const currentPrice = getAssetPrice(alert.symbol);
              const isTriggered = alert.alert_type === 'price_above' 
                ? currentPrice >= alert.threshold
                : currentPrice <= alert.threshold;
              
              return (
                <motion.div
                  key={alert.alert_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass-card p-5 flex items-center justify-between ${
                    isTriggered ? 'border-accent/50' : ''
                  }`}
                  data-testid={`alert-${alert.alert_id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      alert.alert_type === 'price_above' 
                        ? 'bg-secondary/10' 
                        : 'bg-destructive/10'
                    }`}>
                      {alert.alert_type === 'price_above' ? (
                        <ArrowUpRight className="w-6 h-6 text-secondary" />
                      ) : (
                        <ArrowDownRight className="w-6 h-6 text-destructive" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-white flex items-center gap-2">
                        {alert.symbol}
                        {isTriggered && (
                          <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs">
                            Activada
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {alert.alert_type === 'price_above' ? 'Por encima de' : 'Por debajo de'}{' '}
                        <span className="text-white font-medium">${alert.threshold?.toLocaleString()}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {currentPrice && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Precio actual</p>
                        <p className="font-heading font-semibold text-white">
                          ${currentPrice.toLocaleString()}
                        </p>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAlert(alert.alert_id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-12 text-center"
          >
            <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-heading text-xl font-semibold text-white mb-2">
              No tienes alertas configuradas
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Crea alertas de precio para estar al tanto de los movimientos del mercado 
              sin tener que revisar constantemente.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="btn-primary-glow">
              <Plus className="w-4 h-4 mr-2" />
              Crear mi primera alerta
            </Button>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
