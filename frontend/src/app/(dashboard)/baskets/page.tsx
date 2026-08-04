"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBasket,
  Plus,
  Trash2,
  Zap,
  Store,
  MapPin,
  Calculator,
  AlertCircle,
  Bot,
  Sparkles,
  TrendingDown,
} from "lucide-react";

interface OptimizedItem {
  itemName: string;
  matchedProduct: string;
  store: string;
  price: number;
}

interface OptimizationResult {
  strategy: "SINGLE_STORE" | "MULTI_STORE";
  totalCost: number;
  totalSavings: number;
  travelCost: number;
  storesToVisit: string[];
  items: OptimizedItem[];
  aiExplanation: string;
}

export default function BasketsPage() {
  const [items, setItems] = useState<string[]>([
    "Samba Rice 5kg",
    "Anchor Milk Powder 400g",
    "Eggs Pack of 10",
  ]);
  const [newItem, setNewItem] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim() && !items.includes(newItem.trim())) {
      setItems([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleOptimize = async () => {
    if (items.length === 0) return;

    setIsOptimizing(true);
    try {
      const res = await api.post("/baskets/optimize", { shoppingList: items });
      setResult(res.data);
    } catch (error) {
      console.error("Failed to optimize basket:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <PageWrapper className="max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-2">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 6 }}
          className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-primary/20"
        >
          <ShoppingBasket className="h-6 w-6" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            Basket Optimizer AI{" "}
            <Sparkles
              className="w-5 h-5 text-lime-400 animate-spin"
              style={{ animationDuration: "8s" }}
            />
          </h1>
          <p className="text-sm text-muted-foreground">
            Find the ultimate lowest-cost store combinations across Sri Lanka in
            seconds.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        {/* Input Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card rounded-2xl p-6 border-border/80 shadow-xl">
            <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
              Shopping List
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                {items.length} items
              </span>
            </h2>

            <form onSubmit={handleAddItem} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="e.g. White Sugar 1kg"
                className="flex-1 rounded-xl border border-input/80 bg-background/80 px-3.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all shadow-sm"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!newItem.trim()}
                className="bg-primary text-white p-2.5 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-md shadow-primary/20"
              >
                <Plus className="h-5 w-5" />
              </motion.button>
            </form>

            <div className="space-y-2 mb-6 max-h-[320px] overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {items.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-muted-foreground text-center py-8 italic border border-dashed border-border rounded-xl"
                  >
                    Your list is empty. Add items above to optimize!
                  </motion.div>
                )}
                {items.map((item, index) => (
                  <motion.div
                    key={item}
                    layout
                    initial={{ opacity: 0, x: -15, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: 15 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-card/80 border border-border/80 hover:border-primary/40 group shadow-sm transition-all"
                  >
                    <span className="text-sm font-semibold text-foreground">
                      {item}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="text-muted-foreground opacity-60 group-hover:opacity-100 hover:text-destructive transition-all p-1 hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOptimize}
              disabled={items.length === 0 || isOptimizing}
              className="w-full bg-gradient-to-r from-primary via-emerald-500 to-lime-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 text-sm"
            >
              {isOptimizing ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Zap className="h-5 w-5 fill-current" />
              )}
              {isOptimizing
                ? "AI Calculating Lowest Prices..."
                : "Run AI Optimization"}
            </motion.button>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="h-full min-h-[360px] glass-card rounded-2xl border-dashed border-2 border-border/80 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 animate-bounce">
                  <Calculator className="h-10 w-10 opacity-70" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1">
                  Ready for Optimization
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Add items on the left and click &quot;Run AI
                  Optimization&quot; to calculate store-by-store savings.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="glass-card p-4 rounded-2xl text-center border-border/80"
                  >
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold mb-1">
                      Total Cost
                    </p>
                    <p className="text-2xl font-black text-foreground">
                      Rs. {result.totalCost.toFixed(2)}
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -4 }}
                    className="glass-card p-4 rounded-2xl text-center border-emerald-500/30 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                  >
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-extrabold mb-1 flex items-center justify-center gap-1">
                      <TrendingDown className="w-3 h-3" /> Total Savings
                    </p>
                    <p className="text-2xl font-black text-emerald-500">
                      Rs. {result.totalSavings.toFixed(2)}
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -4 }}
                    className="glass-card p-4 rounded-2xl text-center border-border/80"
                  >
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold mb-1">
                      Strategy
                    </p>
                    <p className="text-xs font-black mt-2 text-primary uppercase">
                      {result.strategy === "SINGLE_STORE"
                        ? "Single Store"
                        : "Split Basket"}
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -4 }}
                    className="glass-card p-4 rounded-2xl text-center border-border/80"
                  >
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-extrabold mb-1">
                      Stores to Visit
                    </p>
                    <p className="text-2xl font-black text-foreground">
                      {result.storesToVisit.length}
                    </p>
                  </motion.div>
                </div>

                {/* AI Explanation */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-5 rounded-2xl border-primary/30 bg-primary/5 flex gap-4 items-start shadow-md"
                >
                  <div className="p-2.5 rounded-xl bg-primary/20 text-primary shrink-0">
                    <Bot className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider mb-1">
                      AI Recommendation
                    </h4>
                    <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                      {result.aiExplanation}
                    </p>
                  </div>
                </motion.div>

                {/* Item Breakdown */}
                <div className="glass-card rounded-2xl overflow-hidden border-border/80 shadow-xl">
                  <div className="p-4 border-b border-border/80 bg-muted/40 flex items-center justify-between">
                    <h3 className="font-bold text-foreground flex items-center gap-2 text-sm">
                      <Store className="h-4 w-4 text-primary" />
                      Supermarket Breakdown
                    </h3>
                  </div>
                  <div className="divide-y divide-border/60">
                    {result.storesToVisit.map((store) => {
                      const storeItems = result.items.filter(
                        (item) => item.store === store,
                      );
                      const storeTotal = storeItems.reduce(
                        (sum, item) => sum + item.price,
                        0,
                      );

                      return (
                        <div
                          key={store}
                          className="p-5 hover:bg-muted/10 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-extrabold text-primary flex items-center gap-2 text-base">
                              <MapPin className="h-4.5 w-4.5" />
                              {store}
                            </h4>
                            <span className="text-sm font-extrabold px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
                              Rs. {storeTotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="space-y-2.5 pl-6">
                            {storeItems.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center text-sm p-2 rounded-lg bg-card/60 border border-border/40"
                              >
                                <div>
                                  <span className="font-bold text-foreground">
                                    {item.itemName}
                                  </span>
                                  <span className="text-muted-foreground text-xs ml-2">
                                    ({item.matchedProduct})
                                  </span>
                                </div>
                                <span className="font-bold text-foreground">
                                  Rs. {item.price.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {result.travelCost > 0 && (
                  <div className="flex items-center gap-3 text-xs text-amber-500 bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 font-medium">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>
                      Travel estimate included: Rs. {result.travelCost} (Rs. 200
                      calculated per additional store route)
                    </p>
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
