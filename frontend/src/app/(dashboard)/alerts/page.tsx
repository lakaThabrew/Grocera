"use client"

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, BellRing, Trash2, Mail, MessageSquare, Smartphone, Store, Clock } from 'lucide-react';
import Link from 'next/link';

interface PriceAlert {
  id: string;
  targetPrice: number;
  isActive: boolean;
  emailAlert: boolean;
  smsAlert: boolean;
  pushAlert: boolean;
  createdAt: string;
  product: {
    id: string;
    name: string;
    brand: string;
    store: { name: string };
    prices: Array<{ price: number }>;
  };
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/consumers/alerts');
      setAlerts(res.data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAlert = async (id: string) => {
    try {
      await api.patch(`/consumers/alerts/${id}/toggle`);
      setAlerts(alerts.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
    } catch (error) {
      console.error('Failed to toggle alert', error);
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      await api.delete(`/consumers/alerts/${id}`);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to delete alert', error);
    }
  };

  return (
    <PageWrapper className="max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
          <BellRing className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Price Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Manage your active notifications for price drops.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center p-12 glass-card rounded-xl border border-dashed border-white/10">
          <BellOff className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium text-foreground">No alerts set up</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
            Find products you love and click the bell icon to get notified when the price drops below your target!
          </p>
          <Link href="/products" className="inline-block mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {alerts.map((alert) => {
              const currentPrice = alert.product.prices[0]?.price || 0;
              const diff = currentPrice - alert.targetPrice;
              
              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`glass-card p-5 rounded-xl border relative overflow-hidden transition-all ${
                    alert.isActive ? 'border-primary/20' : 'border-border opacity-60 grayscale'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <Store className="h-3 w-3" /> {alert.product.store.name}
                      </span>
                      <h3 className="font-semibold leading-tight line-clamp-2">
                        {alert.product.name}
                      </h3>
                      {alert.product.brand && (
                        <p className="text-xs text-muted-foreground mt-1">{alert.product.brand}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-muted/30 p-3 rounded-lg border border-border">
                      <p className="text-[10px] uppercase text-muted-foreground font-medium mb-1 flex items-center gap-1">
                        Current <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      </p>
                      <p className="font-bold text-lg">Rs. {currentPrice}</p>
                    </div>
                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/10">
                      <p className="text-[10px] uppercase text-primary/80 font-medium mb-1">Target</p>
                      <p className="font-bold text-lg text-primary">Rs. {alert.targetPrice}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-5 text-muted-foreground">
                    <div className="flex gap-2">
                      {alert.emailAlert && <span title="Email Alerts On"><Mail className="h-4 w-4" /></span>}
                      {alert.pushAlert && <span title="Push Alerts On"><Smartphone className="h-4 w-4" /></span>}
                      {alert.smsAlert && <span title="SMS Alerts On"><MessageSquare className="h-4 w-4" /></span>}
                    </div>
                    <span className="text-xs flex items-center gap-1 ml-auto">
                      <Clock className="h-3 w-3" />
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        alert.isActive 
                          ? 'bg-muted/50 text-foreground hover:bg-muted' 
                          : 'bg-primary/20 text-primary hover:bg-primary/30'
                      }`}
                    >
                      {alert.isActive ? 'Pause Alert' : 'Resume Alert'}
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="px-3 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      title="Delete Alert"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </PageWrapper>
  );
}
