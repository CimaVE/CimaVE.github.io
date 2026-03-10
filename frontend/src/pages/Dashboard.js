import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Wallet, Target, Bell, BookOpen, 
  BarChart3, Sparkles, ArrowUpRight, ArrowDownRight, Plus,
  ChevronRight, RefreshCw, LogOut, User, Settings, Menu, X,
  Layers, Users, FileText, Award
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

const Dashboard = () => {
  const { user, api, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [portfolio, setPortfolio] = useState(null);
  const [goals, setGoals] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [insight, setInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [cryptos, setCryptos] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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
      setCryptos(cryptoRes.data.cryptocurrencies?.slice(0, 5) || []);
      setStocks(stocksRes.data.stocks?.slice(0, 5) || []);
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard' },
    { icon: Layers, label: 'Collections', path: '/collections' },
    { icon: Target, label: 'Objetivos', path: '/goals' },
    { icon: Bell, label: 'Cima Pulse', path: '/alerts' },
    { icon: BookOpen, label: 'Academia', path: '/academy' },
    { icon: FileText, label: 'Reportes', path: '/reports' },
  ];

  return (
    <div className="min-h-screen bg-[#02040A]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-white/5 bg-[#0B0E14]/50 backdrop-blur-xl z-40">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading text-xl font-bold text-white">CIMA<span className="text-primary">VE</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">Score: {user?.cima_score || 0}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#0B0E14] border-white/10">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#0B0E14]/80 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-heading text-lg font-bold text-white">CIMA<span className="text-primary">VE</span></span>
        </Link>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-[#02040A] z-40 p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-destructive w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">
                Hola, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-muted-foreground mt-1">Tu resumen de inversiones</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/20">
                <Award className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Nivel {user?.level || 'Start'}</span>
              </div>
              <Button onClick={fetchData} variant="outline" size="icon" className="border-white/10">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 col-span-1 md:col-span-2"
              data-testid="portfolio-value-card"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Valor del Portafolio</p>
                  <p className="font-heading text-4xl font-bold text-white">
                    ${portfolio?.total_value?.toLocaleString() || '0.00'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-1 ${(portfolio?.return_percent || 0) >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                  {(portfolio?.return_percent || 0) >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">{portfolio?.return_percent || 0}%</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {(portfolio?.total_return || 0) >= 0 ? '+' : ''}${portfolio?.total_return?.toLocaleString() || '0.00'} total
                </span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm text-muted-foreground">Inversión Total</p>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="font-heading text-2xl font-bold text-white">
                ${portfolio?.total_invested?.toLocaleString() || '0.00'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{portfolio?.holdings?.length || 0} activos</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <p className="text-sm text-muted-foreground">Cima Score</p>
                <Award className="w-5 h-5 text-accent" />
              </div>
              <p className="font-heading text-2xl font-bold text-white">{user?.cima_score || 0}</p>
              <Progress value={(user?.cima_score || 0) / 2} className="h-1 mt-3" />
            </motion.div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cima Insights */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
                data-testid="cima-insights-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-white">Cima Insights</h3>
                      <p className="text-xs text-muted-foreground">Análisis personalizado con IA</p>
                    </div>
                  </div>
                  <Button 
                    onClick={generateInsight} 
                    disabled={loadingInsight}
                    size="sm"
                    className="btn-primary-glow"
                    data-testid="generate-insight-btn"
                  >
                    {loadingInsight ? 'Analizando...' : 'Generar Insight'}
                  </Button>
                </div>
                {insight ? (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-foreground/90 leading-relaxed">{insight}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Genera tu primer insight para recibir análisis personalizados de tu portafolio.
                  </p>
                )}
              </motion.div>

              {/* Market Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Crypto */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-semibold text-white">Criptomonedas</h3>
                    <Link to="/collections" className="text-primary text-sm hover:underline flex items-center gap-1">
                      Ver todas <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {cryptos.map((crypto) => (
                      <div key={crypto.coin_id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-accent">{crypto.symbol}</span>
                          </div>
                          <span className="text-sm font-medium text-white">{crypto.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">${crypto.price?.toLocaleString()}</p>
                          <p className={`text-xs ${crypto.change_24h >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                            {crypto.change_24h >= 0 ? '+' : ''}{crypto.change_24h?.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Stocks */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-semibold text-white">Acciones</h3>
                    <Link to="/collections" className="text-primary text-sm hover:underline flex items-center gap-1">
                      Ver todas <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {stocks.map((stock) => (
                      <div key={stock.symbol} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{stock.symbol.slice(0, 2)}</span>
                          </div>
                          <span className="text-sm font-medium text-white">{stock.symbol}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">${stock.price?.toLocaleString()}</p>
                          <p className={`text-xs ${stock.change_24h >= 0 ? 'text-secondary' : 'text-destructive'}`}>
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
            <div className="space-y-6">
              {/* Goals */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
                data-testid="goals-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-white">Mis Objetivos</h3>
                  <Link to="/goals">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                {goals.length > 0 ? (
                  <div className="space-y-4">
                    {goals.slice(0, 3).map((goal) => {
                      const progress = (goal.current_amount / goal.target_amount) * 100;
                      return (
                        <div key={goal.goal_id} className="p-3 rounded-lg bg-white/5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white">{goal.title}</span>
                            <span className="text-xs text-muted-foreground">{progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={progress} className="h-1.5" />
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              ${goal.current_amount?.toLocaleString()} / ${goal.target_amount?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Target className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">No tienes objetivos activos</p>
                    <Link to="/goals">
                      <Button size="sm" variant="outline" className="border-white/10">
                        Crear objetivo
                      </Button>
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Alerts */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6"
                data-testid="alerts-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold text-white">Cima Pulse</h3>
                  <Link to="/alerts">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.slice(0, 3).map((alert) => (
                      <div key={alert.alert_id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                        <Bell className={`w-4 h-4 ${alert.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{alert.symbol}</p>
                          <p className="text-xs text-muted-foreground">
                            {alert.alert_type === 'price_above' ? '>' : '<'} ${alert.threshold}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">Sin alertas configuradas</p>
                    <Link to="/alerts">
                      <Button size="sm" variant="outline" className="border-white/10">
                        Crear alerta
                      </Button>
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6"
              >
                <h3 className="font-heading font-semibold text-white mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/collections">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-white/10 hover:bg-white/5">
                      <Layers className="w-5 h-5 text-primary" />
                      <span className="text-xs">Collections</span>
                    </Button>
                  </Link>
                  <Link to="/academy">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-white/10 hover:bg-white/5">
                      <BookOpen className="w-5 h-5 text-secondary" />
                      <span className="text-xs">Academia</span>
                    </Button>
                  </Link>
                  <Link to="/goals">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-white/10 hover:bg-white/5">
                      <Target className="w-5 h-5 text-accent" />
                      <span className="text-xs">Objetivos</span>
                    </Button>
                  </Link>
                  <Link to="/referrals">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2 border-white/10 hover:bg-white/5">
                      <Users className="w-5 h-5 text-purple-500" />
                      <span className="text-xs">Referidos</span>
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
