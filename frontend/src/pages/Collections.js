import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Layers, TrendingUp, ArrowRight, ChevronLeft, Plus, Check,
  Zap, Globe, Leaf, Bitcoin, ShoppingBag, Heart, DollarSign
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { Toaster, toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';

const categoryIcons = {
  technology: Zap,
  energy: Leaf,
  crypto: Bitcoin,
  consumer: ShoppingBag,
  healthcare: Heart,
  finance: DollarSign,
};

const Collections = () => {
  const { api } = useAuth();
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState({});
  const [cryptos, setCryptos] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [collectionsRes, stocksRes, cryptoRes] = await Promise.all([
        api.get('/collections'),
        api.get('/market/stocks'),
        api.get('/market/crypto')
      ]);
      setCollections(collectionsRes.data.collections || []);
      
      // Convert to lookup objects
      const stocksMap = {};
      stocksRes.data.stocks?.forEach(s => stocksMap[s.symbol] = s);
      setStocks(stocksMap);
      
      const cryptoMap = {};
      cryptoRes.data.cryptocurrencies?.forEach(c => cryptoMap[c.coin_id] = c);
      setCryptos(cryptoMap);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssetData = (symbol) => {
    // Check if it's a stock or crypto
    if (stocks[symbol]) return { ...stocks[symbol], type: 'stock' };
    if (cryptos[symbol.toLowerCase()]) {
      const crypto = cryptos[symbol.toLowerCase()];
      return { 
        symbol: crypto.symbol, 
        name: crypto.name, 
        price: crypto.price, 
        change_24h: crypto.change_24h,
        type: 'crypto' 
      };
    }
    return { symbol, name: symbol, price: 0, change_24h: 0, type: 'unknown' };
  };

  const addToPortfolio = async (collection) => {
    try {
      // Add first asset from collection as a sample
      const symbol = collection.symbols[0];
      const asset = getAssetData(symbol);
      
      await api.post('/portfolio/holdings', {
        symbol: asset.symbol || symbol,
        name: asset.name || symbol,
        quantity: collection.min_investment / (asset.price || 100),
        avg_price: asset.price || 100,
        current_price: asset.price || 100,
        asset_type: asset.type === 'crypto' ? 'crypto' : 'stock',
        collection_id: collection.collection_id
      });
      
      toast.success(`${collection.name} agregada a tu portafolio`);
    } catch (error) {
      toast.error('Error al agregar al portafolio');
    }
  };

  if (selectedCollection) {
    return (
      <DashboardLayout>
        <Toaster position="top-center" theme="dark" />
        <div className="p-4 md:p-6 lg:p-8">
          <button 
            onClick={() => setSelectedCollection(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-white mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver a Collections
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Collection Info */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card overflow-hidden"
              >
                <div className="aspect-video relative">
                  <img 
                    src={selectedCollection.image_url} 
                    alt={selectedCollection.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] to-transparent" />
                </div>
                <div className="p-6">
                  <h1 className="font-heading text-2xl font-bold text-white mb-2">
                    {selectedCollection.name}
                  </h1>
                  <p className="text-muted-foreground mb-6">{selectedCollection.description}</p>
                  
                  <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-white/5">
                    <span className="text-sm text-muted-foreground">Inversión mínima</span>
                    <span className="font-heading text-xl font-bold text-white">
                      ${selectedCollection.min_investment}
                    </span>
                  </div>

                  <Button 
                    className="w-full btn-primary-glow"
                    onClick={() => addToPortfolio(selectedCollection)}
                    data-testid="invest-collection-btn"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Invertir en Collection
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Assets in Collection */}
            <div className="lg:col-span-2">
              <h2 className="font-heading text-xl font-semibold text-white mb-4">
                Activos incluidos ({selectedCollection.symbols.length})
              </h2>
              <div className="space-y-3">
                {selectedCollection.symbols.map((symbol, index) => {
                  const asset = getAssetData(symbol);
                  return (
                    <motion.div
                      key={symbol}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-card p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          asset.type === 'crypto' ? 'bg-accent/20' : 'bg-primary/20'
                        }`}>
                          <span className={`text-sm font-bold ${
                            asset.type === 'crypto' ? 'text-accent' : 'text-primary'
                          }`}>
                            {(asset.symbol || symbol).slice(0, 3)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{asset.name || symbol}</p>
                          <p className="text-sm text-muted-foreground">{asset.symbol || symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-lg font-semibold text-white">
                          ${asset.price?.toLocaleString() || '—'}
                        </p>
                        <p className={`text-sm ${(asset.change_24h || 0) >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                          {(asset.change_24h || 0) >= 0 ? '+' : ''}{asset.change_24h?.toFixed(2) || 0}%
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toaster position="top-center" theme="dark" />
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-white mb-2">
            Cima Collections
          </h1>
          <p className="text-muted-foreground">
            Invierte en temas, no en acciones individuales. Colecciones curadas por expertos.
          </p>
        </div>

        {/* Collections Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection, index) => {
              const Icon = categoryIcons[collection.category] || Layers;
              return (
                <motion.div
                  key={collection.collection_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card overflow-hidden group cursor-pointer hover:border-primary/30 transition-all"
                  onClick={() => setSelectedCollection(collection)}
                  data-testid={`collection-${collection.collection_id}`}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={collection.image_url} 
                      alt={collection.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] to-transparent" />
                    <div className="absolute top-4 left-4">
                      <div className="w-10 h-10 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors">
                      {collection.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {collection.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{collection.symbols.length} activos</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <span className="text-sm font-medium">Desde ${collection.min_investment}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Collections;
