import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Wallet, Target, Bell, BookOpen, 
  Sparkles, ArrowUpRight, ArrowDownRight, Plus, ChevronRight, 
  RefreshCw, Layers, Users, FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { requestNotificationPermission, showNotification } from '../utils/notifications';

const Dashboard = () => {
  const { user, api } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [goals, setGoals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [cryptos, setCryptos] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    fetchData();
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  };

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      showNotification('Notificaciones activadas', {
        body: 'Recibirás alertas cuando tus activos alcancen el precio configurado.'
      });
    }
  };

  const fetchData = async () => {
    try {
      const [portfolioRes, goalsRes, alertsRes, cryptoRes, stocksRes] = await Promise.all([
        api.get('/portfolio'),
        api.get('/goals'),
        api.get('/alerts'),
        api.get('/market/crypto'),
        api.get('/market/stocks')
      ]);
      setPortfolio(portfolioRes.data);
      setGoals(goalsRes.data.goals || []);
      setAlerts(alertsRes.data.alerts || []);
      setCryptos(cryptoRes.data.cryptocurrencies?.slice(0, 4) || []);
      setStocks(stocksRes.data.stocks?.slice(0, 4) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const generateInsight = async () => {
    setLoadingInsight(true);
    try {
      const summary = portfolio?.holdings?.length > 0
        ? `Portafolio con ${portfolio.holdings.length} activos, valor total $${portfolio.total_value}, retorno ${portfolio.return_percent}%`
        : 'Portafolio vacío, usuario nuevo buscando su primera inversión';
      
      const response = await api.post('/insights/generate', { portfolio_summary: summary });
      setInsight(response.data.insight);
    } catch (error) {
      console.error('Error generating insight:', error);
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-white">
              Hola, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-sm text-white/40 mt-1">Tu resumen de inversiones</p>
          </div>
          <div className="flex items-center gap-2">
            {!notificationsEnabled && (
              <Button 
                onClick={enableNotifications} 
                variant="outline" 
                size="sm"
                className="text-xs bg-transparent border-[#252525] hover:bg-white/5 text-white/70"
                data-testid="enable-notifications-btn"
              >
                <Bell className="w-3.5 h-3.5 mr-1.5" />
                Activar alertas
              </Button>
            )}
            <Button 
              onClick={fetchData} 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8 text-white/50 hover:text-white hover:bg-white/5"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-2 card-minimal p-5"
            data-testid="portfolio-value-card"
          >
            <p className="text-xs text-white/40 mb-1">Valor del portafolio</p>
            <p className="text-3xl font-semibold text-white">
              ${portfolio?.total_value?.toLocaleString() || '0.00'}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-sm font-medium ${(portfolio?.return_percent || 0) >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                {(portfolio?.return_percent || 0) >= 0 ? '+' : ''}{portfolio?.return_percent || 0}%
              </span>
              <span className="text-xs text-white/40">
                {(portfolio?.total_return || 0) >= 0 ? '+' : ''}${portfolio?.total_return?.toLocaleString() || '0.00'}
              </span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card-minimal p-5"
          >
            <p className="text-xs text-white/40 mb-1">Invertido</p>
            <p className="text-xl font-semibold text-white">
              ${portfolio?.total_invested?.toLocaleString() || '0.00'}
            </p>
            <p className="text-xs text-white/30 mt-2">{portfolio?.holdings?.length || 0} activos</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-minimal p-5"
          >
            <p className="text-xs text-white/40 mb-1">Cima Score</p>
            <p className="text-xl font-semibold text-white">{user?.cima_score || 0}</p>
            <Progress value={(user?.cima_score || 0) / 2} className="h-1 mt-3 bg-[#1a1a1a]" />
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Insights */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-minimal p-5"
              data-testid="cima-insights-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8B1538]" />
                  <span className="text-sm font-medium text-white">Cima Insights</span>
                </div>
                <Button 
                  onClick={generateInsight} 
                  disabled={loadingInsight}
                  size="sm"
                  className="h-8 text-xs btn-primary"
                  data-testid="generate-insight-btn"
                >
                  {loadingInsight ? 'Analizando...' : 'Generar'}
                </Button>
              </div>
              {insight ? (
                <p className="text-sm text-white/70 leading-relaxed">{insight}</p>
              ) : (
                <p className="text-sm text-white/40">
                  Genera un análisis personalizado de tu portafolio con IA.
                </p>
              )}
            </motion.div>

            {/* Markets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Crypto */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-minimal p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-white">Criptomonedas</span>
                  <Link to="/collections" className="text-xs text-white/40 hover:text-white flex items-center gap-1">
                    Ver más <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {cryptos.map((crypto) => (
                    <div key={crypto.coin_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white/60 w-10">{crypto.symbol}</span>
                        <span className="text-sm text-white">{crypto.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">${crypto.price?.toLocaleString()}</p>
                        <p className={`text-xs ${crypto.change_24h >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                          {crypto.change_24h >= 0 ? '+' : ''}{crypto.change_24h?.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Stocks */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="card-minimal p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-white">Acciones</span>
                  <Link to="/collections" className="text-xs text-white/40 hover:text-white flex items-center gap-1">
                    Ver más <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {stocks.map((stock) => (
                    <div key={stock.symbol} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-white/60 w-10">{stock.symbol}</span>
                        <span className="text-sm text-white truncate max-w-[100px]">{stock.name.split(' ')[0]}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">${stock.price?.toLocaleString()}</p>
                        <p className={`text-xs ${stock.change_24h >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                          {stock.change_24h >= 0 ? '+' : ''}{stock.change_24h?.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Goals */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-minimal p-5"
              data-testid="goals-card"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-white">Objetivos</span>
                <Link to="/goals">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-white/40 hover:text-white hover:bg-white/5">
                    <Plus className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              {goals.length > 0 ? (
                <div className="space-y-3">
                  {goals.slice(0, 2).map((goal) => {
                    const progress = (goal.current_amount / goal.target_amount) * 100;
                    return (
                      <div key={goal.goal_id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-white">{goal.title}</span>
                          <span className="text-xs text-white/40">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-1 bg-[#1a1a1a]" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-white/40">Sin objetivos activos</p>
              )}
            </motion.div>

            {/* Alerts */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="card-minimal p-5"
              data-testid="alerts-card"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-white">Alertas</span>
                <Link to="/alerts">
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-white/40 hover:text-white hover:bg-white/5">
                    <Plus className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              {alerts.length > 0 ? (
                <div className="space-y-2">
                  {alerts.slice(0, 2).map((alert) => (
                    <div key={alert.alert_id} className="flex items-center justify-between py-1">
                      <span className="text-sm text-white">{alert.symbol}</span>
                      <span className="text-xs text-white/40">
                        {alert.alert_type === 'price_above' ? '>' : '<'} ${alert.threshold}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/40">Sin alertas configuradas</p>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card-minimal p-5"
            >
              <span className="text-sm font-medium text-white mb-3 block">Acciones rápidas</span>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/collections">
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5 bg-transparent border-[#1a1a1a] hover:bg-white/5 hover:border-[#252525]">
                    <Layers className="w-4 h-4 text-[#8B1538]" />
                    <span className="text-xs text-white/70">Collections</span>
                  </Button>
                </Link>
                <Link to="/academy">
                  <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5 bg-transparent border-[#1a1a1a] hover:bg-white/5 hover:border-[#252525]">
                    <BookOpen className="w-4 h-4 text-[#8B1538]" />
                    <span className="text-xs text-white/70">Academia</span>
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
