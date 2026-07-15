"use client"

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, Store, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface FavoriteProduct {
  id: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    brand: string;
    store: { name: string };
    prices: Array<{ price: number }>;
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await api.get('/consumers/favorites/products');
      setFavorites(res.data);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (productId: string, id: string) => {
    try {
      await api.post(`/consumers/favorites/products/${productId}`);
      setFavorites(favorites.filter(f => f.id !== id));
    } catch (error) {
      console.error('Failed to remove favorite', error);
    }
  };

  return (
    <PageWrapper className="max-w-6xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-500">
          <Heart className="h-6 w-6 fill-pink-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Wishlist</h1>
          <p className="text-muted-foreground mt-1">
            Keep track of the products you love.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center p-16 glass-card rounded-xl border border-dashed border-white/10">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Your wishlist is empty</h3>
          <p className="text-muted-foreground mt-1 max-w-sm mx-auto mb-6">
            When you see something you like, tap the heart icon to save it here for later.
          </p>
          <Link href="/products" className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {favorites.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="glass-card rounded-xl border border-white/5 overflow-hidden group hover:border-primary/30 transition-all shadow-md"
              >
                <div className="h-40 bg-muted/30 flex items-center justify-center relative">
                  {/* Placeholder for Product Image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent mix-blend-overlay"></div>
                  <Store className="h-12 w-12 text-muted-foreground/30" />
                  
                  <button 
                    onClick={() => removeFavorite(item.product.id, item.id)}
                    className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/50 backdrop-blur flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition-all shadow-sm"
                    title="Remove from wishlist"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </button>
                </div>
                
                <div className="p-4">
                  <div className="text-xs font-semibold text-primary/80 uppercase tracking-wider mb-1">
                    {item.product.store.name}
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-2 min-h-[40px] mb-2">
                    {item.product.name}
                  </h3>
                  
                  <div className="flex items-end justify-between mt-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase mb-0.5">Current Price</p>
                      <p className="font-bold text-lg leading-none">
                        Rs. {item.product.prices[0]?.price || 'N/A'}
                      </p>
                    </div>
                    <Link 
                      href={`/products/${item.product.id}`}
                      className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </PageWrapper>
  );
}
