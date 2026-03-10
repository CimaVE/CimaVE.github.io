import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, ArrowRight, ChevronLeft, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { Toaster, toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';

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
    if (stocks[symbol]) return { ...stocks[symbol], type: 'stock' };
    if (cryptos[symbol.toLowerCase()]) {
      const crypto = cryptos[symbol.toLowerCase()];
      return { symbol: crypto.symbol, name: crypto.name, price: crypto.price, change_24h: crypto.change_24h, type: 'crypto' };
    }
    return { symbol, name: symbol, price: 0, change_24h: 0, type: 'unknown' };
  };

  const addToPortfolio = async (collection) => {
    try {
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
      
      toast.success('Agregado al portafolio');
    } catch (error) {
      toast.error('Error al agregar');
    }
  };

  if (selectedCollection) {
    return (
      <DashboardLayout>
        <Toaster position="top-center" theme="dark" />
        <div className="p-4 md:p-6 lg:p-8 max-w-4xl">
          <button 
            onClick={() => setSelectedCollection(null)}
            className="flex items-center gap-1 text-sm text-white/40 hover:text-white mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-minimal overflow-hidden">
                <div className="aspect-video bg-[#1a1a1a]">
                  <img src={selectedCollection.image_url} alt={selectedCollection.name} className="w-full h-full object-cover opacity-80" />
                </div>
                <div className="p-5">
                  <h1 className="text-lg font-semibold text-white mb-2">{selectedCollection.name}</h1>
                  <p className="text-sm text-white/50 mb-5">{selectedCollection.description}</p>
                  <div className="flex items-center justify-between mb-5 p-3 rounded bg-[#1a1a1a]">
                    <span className="text-xs text-white/40">Mínimo</span>
                    <span className="text-base font-semibold text-white">${selectedCollection.min_investment}</span>
                  </div>
                  <Button className="w-full btn-primary text-sm" onClick={() => addToPortfolio(selectedCollection)} data-testid="invest-collection-btn">
                    <Plus className="w-4 h-4 mr-2" />
                    Invertir
                  </Button>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-sm font-medium text-white mb-4">Activos ({selectedCollection.symbols.length})</h2>
              <div className="space-y-2">
                {selectedCollection.symbols.map((symbol, index) => {
                  const asset = getAssetData(symbol);
                  return (
                    <motion.div
                      key={symbol}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="card-minimal p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-white/50 w-12">{(asset.symbol || symbol).slice(0, 4)}</span>
                        <span className="text-sm text-white">{asset.name || symbol}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">${asset.price?.toLocaleString() || '—'}</p>
                        <p className={`text-xs ${(asset.change_24h || 0) >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
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
      <div className="p-4 md:p-6 lg:p-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-semibold text-white">Collections</h1>
          <p className="text-sm text-white/40 mt-1">Invierte en temas, no en acciones individuales</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-minimal h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.collection_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card-minimal overflow-hidden cursor-pointer group"
                onClick={() => setSelectedCollection(collection)}
                data-testid={`collection-${collection.collection_id}`}
              >
                <div className="aspect-video bg-[#1a1a1a] overflow-hidden">
                  <img 
                    src={collection.image_url} 
                    alt={collection.name}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-sm font-medium text-white mb-1 group-hover:text-[#8B1538] transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-xs text-white/40 mb-3 line-clamp-2">{collection.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">{collection.symbols.length} activos</span>
                    <span className="text-xs text-white">Desde ${collection.min_investment}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Collections;
