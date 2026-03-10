import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Plus, ArrowUpRight, ArrowDownRight,
  Sparkles, RefreshCw, Home, BarChart2, GraduationCap, User,
  ArrowLeftRight, X, Bell, ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { Toaster, toast } from 'sonner';
import BottomNav from '../components/layout/BottomNav';
import { requestNotificationPermission, showNotification } from '../utils/notifications';

const Dashboard = () => {
  const { user, api, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [portfolio, setPortfolio] = useState(null);
  const [cryptos, setCryptos] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [bcvRate, setBcvRate] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState({ name: 'Tesla', ticker: 'TSLA', price: 245.60 });
  const [tradeAmount, setTradeAmount] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    fetchData();
    fetchBCV();
    checkNotificationPermission();
    const interval = setInterval(fetchBCV, 60000);
    return () => clearInterval(interval);
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
      toast.success('Notificaciones activadas');
    }
  };

  const fetchBCV = async () => {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await response.json();
      setBcvRate(data.rates.VES);
    } catch (error) {
      console.error('Error fetching BCV:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [portfolioRes, cryptoRes, stocksRes] = await Promise.all([
        api.get('/portfolio'),
        api.get('/market/crypto'),
        api.get('/market/stocks')
      ]);
      setPortfolio(portfolioRes.data);
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

  const executeTrade = async () => {
    const amount = parseFloat(tradeAmount);
    if (!amount || amount <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    try {
      await api.post('/portfolio/holdings', {
        symbol: selectedAsset.ticker,
        name: selectedAsset.name,
        quantity: amount / selectedAsset.price,
        avg_price: selectedAsset.price,
        current_price: selectedAsset.price,
        asset_type: selectedAsset.ticker === 'BTC' ? 'crypto' : 'stock'
      });
      
      toast.success('¡Orden ejecutada!');
      setTradeOpen(false);
      setTradeAmount('');
      fetchData();
    } catch (error) {
      toast.error('Error al ejecutar orden');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      <Toaster position="top-center" theme="dark" />
      
      {/* Header */}
      <header className="flex justify-between items-center px-5 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#111] border border-[#1a1a1a] flex items-center justify-center text-sm font-bold text-[#8B1538]">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">Portafolio</h1>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
              <span className="text-[10px] text-white/40">En Vivo</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!notificationsEnabled && (
            <button 
              onClick={enableNotifications}
              className="p-2 bg-[#111] rounded-full border border-[#1a1a1a] text-white/50 hover:text-white"
            >
              <Bell className="w-5 h-5" />
            </button>
          )}
          <button onClick={fetchData} className="p-2 bg-[#111] rounded-full border border-[#1a1a1a] text-white/50 hover:text-white">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-5 pt-4">
        {/* Portfolio Value */}
        <div className="text-center mb-8">
          <p className="text-white/40 text-xs font-medium tracking-widest uppercase mb-1">Patrimonio Total</p>
          <h2 className="text-4xl font-bold text-white tracking-tight">
            ${portfolio?.total_value?.toLocaleString() || '0.00'}
          </h2>
          <p className={`text-xs font-medium mt-1 flex justify-center items-center gap-1 ${
            (portfolio?.return_percent || 0) >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'
          }`}>
            {(portfolio?.return_percent || 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {(portfolio?.return_percent || 0) >= 0 ? '+' : ''}{portfolio?.return_percent || 0}% (Hoy)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Link to="/deposit" className="bg-[#8B1538] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#8B1538]/20 active:scale-95 transition">
            <Plus className="w-4 h-4" /> Recargar
          </Link>
          <Link to="/withdraw" className="bg-[#111] text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 border border-[#1a1a1a] active:scale-95 transition">
            <ArrowUpRight className="w-4 h-4" /> Retirar
          </Link>
        </div>

        {/* BCV Rate Card */}
        {bcvRate && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111] p-4 rounded-xl border border-[#1a1a1a] flex justify-between items-center mb-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-lg">🇻🇪</div>
              <div>
                <h4 className="font-bold text-white text-sm">Bolívares</h4>
                <p className="text-xs text-[#22C55E]">Tasa BCV: <span className="text-white font-bold">Bs. {bcvRate.toFixed(2)}</span></p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-white text-sm">Bs. 10.000,00</p>
              <p className="text-xs text-white/40">Saldo Disp.</p>
            </div>
          </motion.div>
        )}

        {/* AI Insights */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111] p-5 rounded-xl border border-[#1a1a1a] mb-6"
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
            <p className="text-sm text-white/40">Genera un análisis personalizado de tu portafolio con IA.</p>
          )}
        </motion.div>

        {/* Assets Section */}
        <h3 className="text-lg font-bold text-white mb-4">Mis Activos</h3>
        <div className="space-y-3 mb-6">
          {portfolio?.holdings?.length > 0 ? (
            portfolio.holdings.slice(0, 4).map((holding, i) => (
              <motion.div
                key={holding.holding_id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-[#111] p-4 rounded-xl border border-[#1a1a1a] flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white font-bold text-xs border border-[#252525]">
                    {holding.symbol?.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{holding.name}</h4>
                    <p className="text-xs text-white/40">{holding.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white text-sm">${(holding.quantity * holding.current_price).toFixed(2)}</p>
                  <p className="text-xs text-white/40">{holding.quantity.toFixed(4)} unid.</p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-[#111] p-8 rounded-xl border border-[#1a1a1a] text-center">
              <p className="text-white/40 text-sm">Sin activos aún. ¡Haz tu primera inversión!</p>
            </div>
          )}
        </div>

        {/* Market Preview */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Mercado</h3>
          <Link to="/collections" className="text-xs text-white/40 hover:text-white flex items-center gap-1">
            Ver todo <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="space-y-2">
          {[...stocks.slice(0, 2), ...cryptos.slice(0, 2)].map((asset, i) => (
            <motion.div
              key={asset.symbol || asset.coin_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-[#111] p-4 rounded-xl border border-[#1a1a1a] flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white font-bold text-xs">
                  {(asset.symbol || '??').slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{asset.name}</h4>
                  <p className="text-[10px] text-white/40 uppercase">{asset.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-white text-sm">${asset.price?.toLocaleString()}</p>
                <p className={`text-xs ${asset.change_24h >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                  {asset.change_24h >= 0 ? '+' : ''}{asset.change_24h?.toFixed(2)}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onTradeClick={() => setTradeOpen(true)} />

      {/* Trade Panel (Bottom Sheet) */}
      <AnimatePresence>
        {tradeOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTradeOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 w-full bg-[#111] rounded-t-[2rem] p-6 border-t border-[#1a1a1a] z-[70] max-h-[65vh] flex flex-col"
            >
              <div className="w-12 h-1.5 bg-[#1a1a1a] rounded-full mx-auto mb-6"></div>
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Comprar</h2>
                <button onClick={() => setTradeOpen(false)} className="bg-[#1a1a1a] p-2 rounded-full text-white/50">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Asset Selection */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                {[
                  { name: 'Tesla', ticker: 'TSLA', price: 245.60 },
                  { name: 'Bitcoin', ticker: 'BTC', price: 67432 },
                  { name: 'Apple', ticker: 'AAPL', price: 178.50 },
                  { name: 'NVIDIA', ticker: 'NVDA', price: 726.13 },
                ].map((asset) => (
                  <button
                    key={asset.ticker}
                    onClick={() => setSelectedAsset(asset)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition whitespace-nowrap ${
                      selectedAsset.ticker === asset.ticker
                        ? 'bg-[#8B1538] text-white'
                        : 'bg-[#1a1a1a] text-white/60 border border-[#252525]'
                    }`}
                  >
                    {asset.name}
                  </button>
                ))}
              </div>

              {/* Amount Input */}
              <div className="flex-1 flex flex-col items-center justify-center mb-8">
                <div className="flex items-center justify-center">
                  <span className="text-3xl text-[#8B1538] mr-2">$</span>
                  <input
                    type="number"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    placeholder="0"
                    className="bg-transparent text-5xl font-bold text-white focus:outline-none placeholder-white/20 text-center w-32"
                    data-testid="trade-amount-input"
                  />
                </div>
                <p className="text-white/40 text-sm mt-4">
                  Comprando: {selectedAsset.name} ({selectedAsset.ticker}) @ ${selectedAsset.price.toLocaleString()}
                </p>
              </div>

              <Button 
                onClick={executeTrade}
                className="w-full btn-primary py-4 text-lg"
                data-testid="confirm-trade-btn"
              >
                Confirmar Orden
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
