"use client"

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Package, Store as StoreIcon, Tag } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string | null;
  weight: string | null;
  store: { name: string };
  prices: { price: number; currency: string }[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await api.get('/scraping/products');
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Products</h1>
        <p className="text-sm text-muted-foreground">
          View all scraped products from the Retail Engine.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 border border-border rounded-xl bg-card">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">No products found</h3>
          <p className="text-muted-foreground text-sm mt-2">
            Run the scraper engine to populate products.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="border border-border bg-card rounded-xl overflow-hidden hover:border-primary/50 transition-all shadow-sm">
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full flex items-center gap-1">
                    <StoreIcon className="h-3 w-3" />
                    {product.store.name}
                  </span>
                  {product.brand && (
                    <span className="text-xs text-muted-foreground font-medium">{product.brand}</span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground line-clamp-2 min-h-[3rem]">{product.name}</h3>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                  <p className="text-lg font-bold text-foreground">
                    {product.prices[0]?.currency} {product.prices[0]?.price.toFixed(2)}
                  </p>
                </div>
                {product.weight && (
                  <div className="bg-muted px-2 py-1 rounded text-xs font-medium text-foreground">
                    {product.weight}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
