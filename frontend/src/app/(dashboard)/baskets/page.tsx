"use client"

import { useState } from 'react';
import { api } from '@/lib/api';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBasket, Plus, Trash2, Zap, Store, MapPin, Calculator, AlertCircle, Bot } from 'lucide-react';

interface OptimizedItem {
  itemName: string;
  matchedProduct: string;
  store: string;
  price: number;
}

interface OptimizationResult {
  strategy: 'SINGLE_STORE' | 'MULTI_STORE';
  totalCost: number;
  totalSavings: number;
  travelCost: number;
  storesToVisit: string[];
  items: OptimizedItem[];
  aiExplanation: string;
}

export default function BasketsPage() {
  const [items, setItems] = useState<string[]>(['Rice', 'Milk', 'Eggs']);
  const [newItem, setNewItem] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim() && !items.includes(newItem.trim())) {
      setItems([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleOptimize = async () => {
    if (items.length === 0) return;
    
    setIsOptimizing(true);
    try {
      const res = await api.post('/baskets/optimize', { shoppingList: items });
      setResult(res.data);
    } catch (error) {
      console.error('Failed to optimize basket:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <PageWrapper className="max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
          <ShoppingBasket className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Basket Optimizer AI</h1>
          <p className="text-sm text-muted-foreground">
            Find the cheapest combination of stores for your shopping list.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card rounded-xl p-5 border-white/5">
            <h2 className="text-lg font-semibold mb-4">Your List</h2>
            
            <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="e.g. Bread"
                className="flex-1 rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
              <button
                type="submit"
                disabled={!newItem.trim()}
                className="bg-primary/10 text-primary hover:bg-primary/20 p-2 rounded-md transition-colors disabled:opacity-50"
              >
                <Plus className="h-5 w-5" />
              </button>
            </form>

            <div className="space-y-2 mb-6">
              <AnimatePresence>
                {items.length === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-muted-foreground text-center py-4 italic"
                  >
                    Your list is empty. Add some items to get started.
                  </motion.p>
                )}
                {items.map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border group"
                  >
                    <span className="text-sm font-medium">{item}</span>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              onClick={handleOptimize}
              disabled={items.length === 0 || isOptimizing}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 shadow-md shadow-primary/20"
            >
              {isOptimizing ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Zap className="h-5 w-5" />
              )}
              {isOptimizing ? 'Optimizing...' : 'Optimize Basket'}
            </button>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[300px] glass-card rounded-xl border-white/5 border-dashed border-2 flex flex-col items-center justify-center text-muted-foreground"
              >
                <Calculator className="h-12 w-12 mb-4 opacity-20" />
                <p>Build your list and click Optimize to see results</p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card p-4 rounded-xl text-center">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Total Cost</p>
                    <p className="text-2xl font-bold text-primary">Rs. {result.totalCost.toFixed(2)}</p>
                  </div>
                  <div className="glass-card p-4 rounded-xl text-center border-emerald-500/20 bg-emerald-500/5">
                    <p className="text-xs text-emerald-500/80 mb-1 uppercase tracking-wider font-semibold">Savings</p>
                    <p className="text-2xl font-bold text-emerald-500">Rs. {result.totalSavings.toFixed(2)}</p>
                  </div>
                  <div className="glass-card p-4 rounded-xl text-center">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Strategy</p>
                    <p className="text-sm font-bold mt-2">
                      {result.strategy === 'SINGLE_STORE' ? 'Single Store' : 'Split Basket'}
                    </p>
                  </div>
                  <div className="glass-card p-4 rounded-xl text-center">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Stores</p>
                    <p className="text-2xl font-bold">{result.storesToVisit.length}</p>
                  </div>
                </div>

                {/* AI Explanation */}
                <div className="glass-card p-5 rounded-xl border-primary/20 bg-primary/5 flex gap-4">
                  <Bot className="h-6 w-6 text-primary shrink-0" />
                  <p className="text-sm text-primary/90 leading-relaxed font-medium">
                    {result.aiExplanation}
                  </p>
                </div>

                {/* Item Breakdown */}
                <div className="glass-card rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/20">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      Shopping Breakdown
                    </h3>
                  </div>
                  <div className="divide-y divide-border">
                    {result.storesToVisit.map((store) => {
                      const storeItems = result.items.filter(item => item.store === store);
                      const storeTotal = storeItems.reduce((sum, item) => sum + item.price, 0);

                      return (
                        <div key={store} className="p-4 hover:bg-muted/10 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-primary flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {store}
                            </h4>
                            <span className="text-sm font-medium">Rs. {storeTotal.toFixed(2)}</span>
                          </div>
                          <div className="space-y-2 pl-6">
                            {storeItems.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                <div>
                                  <span className="font-medium">{item.itemName}</span>
                                  <span className="text-muted-foreground text-xs ml-2">({item.matchedProduct})</span>
                                </div>
                                <span className="text-muted-foreground">Rs. {item.price.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {result.travelCost > 0 && (
                  <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>Travel estimate included: Rs. {result.travelCost} (Rs. 200 per additional store)</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  );
}
