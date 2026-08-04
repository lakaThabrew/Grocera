"use client";

import { useState } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  Store,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Clock,
  Search,
} from "lucide-react";
import Link from "next/link";

interface DiscountItem {
  id: string;
  name: string;
  brand: string;
  store: string;
  originalPrice: number;
  discountedPrice: number;
  percentage: number;
  weight: string;
  category: string;
  endsIn: string;
}

const mockDiscounts: DiscountItem[] = [
  {
    id: "disc-1",
    name: "Samba Rice 5kg Premium",
    brand: "Nipuna",
    store: "Keells",
    originalPrice: 1250.0,
    discountedPrice: 1050.0,
    percentage: 16,
    weight: "5kg",
    category: "Grains & Staples",
    endsIn: "2 days",
  },
  {
    id: "disc-2",
    name: "Full Cream Milk Powder 400g",
    brand: "Anchor",
    store: "Cargills",
    originalPrice: 1100.0,
    discountedPrice: 950.0,
    percentage: 14,
    weight: "400g",
    category: "Dairy & Eggs",
    endsIn: "1 day",
  },
  {
    id: "disc-3",
    name: "Ceylon Black Tea Bags 100s",
    brand: "Dilmah",
    store: "Arpico",
    originalPrice: 850.0,
    discountedPrice: 680.0,
    percentage: 20,
    weight: "200g",
    category: "Beverages",
    endsIn: "4 days",
  },
  {
    id: "disc-4",
    name: "Extra Virgin Olive Oil 500ml",
    brand: "Borges",
    store: "Glomark",
    originalPrice: 3800.0,
    discountedPrice: 3200.0,
    percentage: 15,
    weight: "500ml",
    category: "Oils & Cooking",
    endsIn: "3 days",
  },
  {
    id: "disc-5",
    name: "White Sugar 1kg",
    brand: "Pelwatte",
    store: "Keells",
    originalPrice: 360.0,
    discountedPrice: 310.0,
    percentage: 14,
    weight: "1kg",
    category: "Grains & Staples",
    endsIn: "5 days",
  },
  {
    id: "disc-6",
    name: "Fresh Farm Eggs 10 Pack",
    brand: "Araliya",
    store: "Cargills",
    originalPrice: 580.0,
    discountedPrice: 490.0,
    percentage: 15,
    weight: "10 Pack",
    category: "Dairy & Eggs",
    endsIn: "12 hours",
  },
];

export default function DiscountsPage() {
  const [selectedStore, setSelectedStore] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const stores = ["ALL", "Keells", "Cargills", "Arpico", "Glomark"];

  const filteredDiscounts = mockDiscounts.filter((item) => {
    const matchesStore =
      selectedStore === "ALL" ||
      item.store.toLowerCase() === selectedStore.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStore && matchesSearch;
  });

  return (
    <PageWrapper className="max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-3">
            <Sparkles
              className="w-3.5 h-3.5 text-lime-400 animate-spin"
              style={{ animationDuration: "6s" }}
            />{" "}
            Active Promotions & Deals
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            Today&apos;s Best Grocery Deals{" "}
            <Tag className="w-7 h-7 text-primary" />
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time price drop offers detected across Keells, Cargills Food
            City, Arpico Supercentre & Glomark.
          </p>
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deals..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Store Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
        {stores.map((store) => (
          <motion.button
            key={store}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelectedStore(store)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 ${
              selectedStore === store
                ? "bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg shadow-primary/25"
                : "bg-card hover:bg-muted text-muted-foreground border border-border/80"
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            {store}
          </motion.button>
        ))}
      </div>

      {/* Grid of Discounts */}
      {filteredDiscounts.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl border border-dashed border-border/80">
          <Tag className="h-12 w-12 text-muted-foreground opacity-40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground">
            No active deals found
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            Try clearing your filters or searching for another keyword.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDiscounts.map((item) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card rounded-2xl p-6 relative overflow-hidden border border-border/80 hover:border-primary/40 shadow-xl hover:shadow-2xl group flex flex-col justify-between"
              >
                {/* Floating Discount Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-lime-500 text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-md flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> -{item.percentage}%
                  OFF
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-primary mb-2">
                    <Store className="w-3.5 h-3.5" /> {item.store} •{" "}
                    <span className="text-muted-foreground">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-foreground text-lg leading-tight group-hover:text-primary transition-colors mb-1">
                    {item.name}
                  </h3>

                  <p className="text-xs text-muted-foreground font-semibold mb-4">
                    Brand: {item.brand} • Pack: {item.weight}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/60 flex items-center justify-between mt-4">
                  <div>
                    <span className="text-xs text-muted-foreground line-through mr-2 font-semibold">
                      Rs. {item.originalPrice.toFixed(2)}
                    </span>
                    <div className="text-2xl font-black text-emerald-500">
                      Rs. {item.discountedPrice.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      <Clock className="w-3 h-3" /> Ends in {item.endsIn}
                    </span>
                    <Link
                      href={`/products`}
                      className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                    >
                      Compare Stores <ArrowRight className="w-3.5 h-3.5" />
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
