import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Plus, Trash2, TrendingUp, TrendingDown, 
  ArrowUpRight, ArrowDownRight, BellRing
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { Toaster, toast } from 'sonner';
import BottomNav from '../components/layout/BottomNav';
import { requestNotificationPermission, showNotification, checkAlerts } from '../utils/notifications';
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    alert_type: 'price_above',
    threshold: ''
  });

  useEffect(() => {
    fetchData();
    checkNotificationStatus();
  }, []);

  // Check alerts periodically
  useEffect(() => {
    if (!notificationsEnabled || alerts.length === 0) return;
    
    const interval = setInterval(() => {
      checkAlerts(alerts, stocks, cryptos);
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [alerts, stocks, cryptos, notificationsEnabled]);

  const checkNotificationStatus = () => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  };

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      toast.success('Notificaciones activadas');
      showNotification('Alertas activadas', {
        body: 'Recibirás notificaciones cuando tus activos alcancen el precio configurado.'
      });
    } else {
      toast.error('No se pudieron activar las notificaciones');
    }
  };

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
      toast.error('Completa todos los campos');
      return;
    }

    try {
      await api.post('/alerts', {
        ...newAlert,
        threshold: parseFloat(newAlert.threshold)
      });
      toast.success('Alerta creada');
      
      // Show notification if enabled
      if (notificationsEnabled) {
        showNotification('Nueva alerta configurada', {
          body: `Recibirás una notificación cuando ${newAlert.symbol} ${newAlert.alert_type === 'price_above' ? 'suba a' : 'baje a'} $${newAlert.threshold}`
        });
      }
      
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

  const getAssetPrice = (symbol) => {
    const stock = stocks.find(s => s.symbol === symbol);
    if (stock) return stock.price;
    const crypto = cryptos.find(c => c.symbol === symbol);
    if (crypto) return crypto.price;
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      <Toaster position="top-center" theme="dark" />
      <div className="px-5 pt-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-white">Alertas de precio</h1>
            <p className="text-sm text-white/40 mt-1">
              Recibe notificaciones cuando tus activos alcancen el precio configurado
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!notificationsEnabled && (
              <Button 
                onClick={enableNotifications}
                variant="outline"
                className="text-sm bg-transparent border-[#252525] hover:bg-white/5 text-white/70"
                data-testid="enable-notifications-btn"
              >
                <BellRing className="w-4 h-4 mr-2" />
                Activar notificaciones
              </Button>
            )}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary text-sm" data-testid="create-alert-btn">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva alerta
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#111111] border-[#1a1a1a]">
                <DialogHeader>
                  <DialogTitle className="text-lg text-white">Crear alerta de precio</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-xs text-white/50 mb-2 block">Activo</label>
                    <Select 
                      value={newAlert.symbol} 
                      onValueChange={(value) => setNewAlert({ ...newAlert, symbol: value })}
                    >
                      <SelectTrigger className="bg-[#0A0A0A] border-[#1a1a1a] text-white">
                        <SelectValue placeholder="Selecciona un activo" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-[#1a1a1a] max-h-60">
                        <div className="px-2 py-1 text-xs text-white/40">Acciones</div>
                        {stocks.map((stock) => (
                          <SelectItem key={stock.symbol} value={stock.symbol} className="text-white/70 focus:bg-white/5 focus:text-white">
                            {stock.symbol} - ${stock.price?.toLocaleString()}
                          </SelectItem>
                        ))}
                        <div className="px-2 py-1 text-xs text-white/40 mt-2">Criptomonedas</div>
                        {cryptos.map((crypto) => (
                          <SelectItem key={crypto.symbol} value={crypto.symbol} className="text-white/70 focus:bg-white/5 focus:text-white">
                            {crypto.symbol} - ${crypto.price?.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-2 block">Condición</label>
                    <Select 
                      value={newAlert.alert_type} 
                      onValueChange={(value) => setNewAlert({ ...newAlert, alert_type: value })}
                    >
                      <SelectTrigger className="bg-[#0A0A0A] border-[#1a1a1a] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111111] border-[#1a1a1a]">
                        <SelectItem value="price_above" className="text-white/70 focus:bg-white/5 focus:text-white">
                          <span className="flex items-center gap-2">
                            <ArrowUpRight className="w-4 h-4 text-[#22C55E]" />
                            Sube por encima de
                          </span>
                        </SelectItem>
                        <SelectItem value="price_below" className="text-white/70 focus:bg-white/5 focus:text-white">
                          <span className="flex items-center gap-2">
                            <ArrowDownRight className="w-4 h-4 text-[#EF4444]" />
                            Baja por debajo de
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 mb-2 block">Precio (USD)</label>
                    <Input
                      type="number"
                      value={newAlert.threshold}
                      onChange={(e) => setNewAlert({ ...newAlert, threshold: e.target.value })}
                      placeholder="150.00"
                      className="bg-[#0A0A0A] border-[#1a1a1a] text-white placeholder:text-white/30"
                      data-testid="alert-threshold-input"
                    />
                  </div>
                  <Button onClick={createAlert} className="w-full btn-primary" data-testid="submit-alert-btn">
                    Crear alerta
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Notification Status */}
        {notificationsEnabled && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-minimal p-4 mb-6 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
              <BellRing className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div>
              <p className="text-sm text-white">Notificaciones activas</p>
              <p className="text-xs text-white/40">Recibirás alertas cuando se cumplan las condiciones</p>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card-minimal p-4">
            <p className="text-xs text-white/40 mb-1">Activas</p>
            <p className="text-xl font-semibold text-white">{alerts.filter(a => a.is_active).length}</p>
          </div>
          <div className="card-minimal p-4">
            <p className="text-xs text-white/40 mb-1">Alcistas</p>
            <p className="text-xl font-semibold text-[#22C55E]">{alerts.filter(a => a.alert_type === 'price_above').length}</p>
          </div>
          <div className="card-minimal p-4">
            <p className="text-xs text-white/40 mb-1">Bajistas</p>
            <p className="text-xl font-semibold text-[#EF4444]">{alerts.filter(a => a.alert_type === 'price_below').length}</p>
          </div>
        </div>

        {/* Alerts List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-minimal h-16 animate-pulse" />
            ))}
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert, index) => {
              const currentPrice = getAssetPrice(alert.symbol);
              const isTriggered = alert.alert_type === 'price_above' 
                ? currentPrice >= alert.threshold
                : currentPrice <= alert.threshold;
              
              return (
                <motion.div
                  key={alert.alert_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`card-minimal p-4 flex items-center justify-between ${
                    isTriggered ? 'border-[#8B1538]/50' : ''
                  }`}
                  data-testid={`alert-${alert.alert_id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${
                      alert.alert_type === 'price_above' 
                        ? 'bg-[#22C55E]/10' 
                        : 'bg-[#EF4444]/10'
                    }`}>
                      {alert.alert_type === 'price_above' ? (
                        <ArrowUpRight className="w-4 h-4 text-[#22C55E]" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-[#EF4444]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white flex items-center gap-2">
                        {alert.symbol}
                        {isTriggered && (
                          <span className="px-1.5 py-0.5 rounded bg-[#8B1538]/20 text-[#8B1538] text-xs">
                            Activada
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-white/40">
                        {alert.alert_type === 'price_above' ? '>' : '<'} ${alert.threshold?.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {currentPrice && (
                      <div className="text-right">
                        <p className="text-xs text-white/40">Actual</p>
                        <p className="text-sm text-white">${currentPrice.toLocaleString()}</p>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteAlert(alert.alert_id)}
                      className="w-8 h-8 text-white/30 hover:text-[#EF4444] hover:bg-[#EF4444]/10"
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-minimal p-12 text-center"
          >
            <Bell className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <h3 className="text-base font-medium text-white mb-1">Sin alertas</h3>
            <p className="text-sm text-white/40 mb-4">
              Crea alertas para recibir notificaciones cuando tus activos alcancen el precio deseado.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="btn-primary text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Crear alerta
            </Button>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Alerts;
