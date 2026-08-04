"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "@/lib/api";
import { Package, Store as StoreIcon, Tag, Sparkles } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { motion, AnimatePresence } from "framer-motion";

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
  const [selectedStore, setSelectedStore] = useState<string>("ALL");

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await api.get("/scraping/products");
        setProducts(res.data);
      } catch (err) {
        if (!axios.isAxiosError(err) || err.response?.status !== 401) {
          console.error("Failed to load products", err);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const stores = [
    "ALL",
    ...Array.from(new Set(products.map((p) => p.store.name))),
  ];
  const filteredProducts =
    selectedStore === "ALL"
      ? products
      : products.filter((p) => p.store.name === selectedStore);

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
            Supermarket Catalog{" "}
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time scraped products and prices across Sri Lankan retailers.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {stores.map((store) => (
            <motion.button
              key={store}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedStore(store)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedStore === store
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "bg-card hover:bg-muted text-muted-foreground border border-border/80"
              }`}
            >
              {store}
            </motion.button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-5 space-y-4 animate-pulse"
            >
              <div className="h-6 bg-muted/60 rounded-md w-1/2" />
              <div className="h-12 bg-muted/40 rounded-lg w-full" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-8 bg-muted/60 rounded-md w-1/3" />
                <div className="h-6 bg-muted/40 rounded-full w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 glass-card rounded-3xl border-dashed border-2 border-border/80"
        >
          <Package className="h-14 w-14 text-muted-foreground mx-auto mb-4 opacity-40 animate-bounce" />
          <h3 className="text-lg font-bold text-foreground">
            No products found
          </h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
            Trigger the scraper engine to scrape supermarket prices into your
            database.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                key={product.id}
                className="glass-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-border/80 hover:border-primary/40 group cursor-pointer flex flex-col justify-between"
              >
                <div className="p-5 border-b border-border/60 bg-gradient-to-b from-card to-card/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold px-2.5 py-1 bg-primary/10 text-primary rounded-full flex items-center gap-1.5 border border-primary/20">
                      <StoreIcon className="h-3 w-3" />
                      {product.store.name}
                    </span>
                    {product.brand && (
                      <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                        <Tag className="h-3 w-3" /> {product.brand}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-foreground leading-snug line-clamp-2 min-h-[2.75rem] group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </div>

                <div className="p-5 bg-muted/20 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground mb-0.5">
                      Current Price
                    </p>
                    <p className="text-xl font-extrabold text-foreground group-hover:text-primary transition-colors">
                      {product.prices[0]?.currency || "Rs."}{" "}
                      {product.prices[0]?.price.toFixed(2)}
                    </p>
                  </div>
                  {product.weight && (
                    <div className="bg-card border border-border/80 px-2.5 py-1 rounded-lg text-xs font-bold text-foreground shadow-sm">
                      {product.weight}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </PageWrapper>
  );
}
