"use client";

import { useState, use } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { motion } from "framer-motion";
import {
  Store,
  Tag,
  Heart,
  Bell,
  ArrowLeft,
  TrendingDown,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockPriceHistory = [
  { date: "May 1", Keells: 1250, Cargills: 1280, Arpico: 1260 },
  { date: "May 10", Keells: 1220, Cargills: 1250, Arpico: 1260 },
  { date: "May 20", Keells: 1180, Cargills: 1200, Arpico: 1240 },
  { date: "Jun 1", Keells: 1150, Cargills: 1190, Arpico: 1200 },
  { date: "Jun 15", Keells: 1080, Cargills: 1150, Arpico: 1180 },
  { date: "Jul 1", Keells: 1050, Cargills: 1100, Arpico: 1140 },
];

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const [isFavorited, setIsFavorited] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState("1000");
  const [alertSuccess, setAlertSuccess] = useState(false);

  const product = {
    id: productId,
    name: "Samba Rice 5kg Premium",
    brand: "Nipuna",
    weight: "5kg",
    category: "Grains & Staples",
    stores: [
      {
        store: "Keells",
        price: 1050.0,
        inStock: true,
        lastUpdated: "10m ago",
        isLowest: true,
      },
      {
        store: "Cargills Food City",
        price: 1100.0,
        inStock: true,
        lastUpdated: "1h ago",
        isLowest: false,
      },
      {
        store: "Arpico Supercentre",
        price: 1140.0,
        inStock: true,
        lastUpdated: "3h ago",
        isLowest: false,
      },
      {
        store: "Glomark",
        price: 1160.0,
        inStock: false,
        lastUpdated: "5h ago",
        isLowest: false,
      },
    ],
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertSuccess(true);
    setTimeout(() => {
      setAlertSuccess(false);
      setShowAlertModal(false);
    }, 2000);
  };

  return (
    <PageWrapper className="max-w-6xl mx-auto w-full">
      {/* Back Link */}
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Supermarket Catalog
      </Link>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Product Info Card */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-3xl p-6 border-border/80 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold px-3 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> {product.category}
              </span>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsFavorited(!isFavorited)}
                className={`p-2.5 rounded-full transition-all ${
                  isFavorited
                    ? "bg-pink-500 text-white shadow-md shadow-pink-500/30"
                    : "bg-muted/80 text-muted-foreground hover:text-pink-500"
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`}
                />
              </motion.button>
            </div>

            <h1 className="text-2xl font-extrabold text-foreground tracking-tight mb-2">
              {product.name}
            </h1>

            <p className="text-sm text-muted-foreground font-semibold mb-6">
              Brand: <span className="text-foreground">{product.brand}</span> •
              Weight: <span className="text-foreground">{product.weight}</span>
            </p>

            {/* Price Alert Action */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAlertModal(true)}
              className="w-full py-3 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Bell className="w-4 h-4" /> Set Target Price Alert
            </motion.button>
          </motion.div>
        </div>

        {/* Right Column: Multi-Store Comparison & Historical Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Store Comparison Matrix */}
          <div className="glass-card rounded-3xl p-6 border-border/80 shadow-2xl">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" /> Live Price Comparison
              Across Retailers
            </h3>

            <div className="space-y-3">
              {product.stores.map((s) => (
                <div
                  key={s.store}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    s.isLowest
                      ? "bg-emerald-500/10 border-emerald-500/30 shadow-md"
                      : "bg-card/70 border-border/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${s.isLowest ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"}`}
                    >
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">
                          {s.store}
                        </span>
                        {s.isLowest && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3" /> LOWEST PRICE
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Updated {s.lastUpdated}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-xl font-extrabold ${s.isLowest ? "text-emerald-500" : "text-foreground"}`}
                    >
                      Rs. {s.price.toFixed(2)}
                    </div>
                    <span
                      className={`text-[10px] font-semibold ${s.inStock ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}
                    >
                      {s.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Price Chart */}
          <div className="glass-card rounded-3xl p-6 border-border/80 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  30-Day Price History
                </h3>
                <p className="text-xs text-muted-foreground">
                  Track supermarket price changes over time
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Historical Tracking
              </span>
            </div>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockPriceHistory}>
                  <defs>
                    <linearGradient
                      id="colorKeells"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--primary)"
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `Rs.${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                      color: "var(--foreground)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Keells"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorKeells)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Target Price Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 rounded-3xl max-w-md w-full border border-white/20 shadow-2xl relative"
          >
            <h3 className="text-xl font-extrabold text-foreground mb-2 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Create Price Alert
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              We will notify you immediately via email and browser push when the
              price of <strong>{product.name}</strong> drops to your target
              price.
            </p>

            {alertSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm font-semibold flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Alert set successfully!
              </div>
            ) : (
              <form onSubmit={handleCreateAlert} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Target Price (Rs.)
                  </label>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    className="w-full mt-1.5 rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAlertModal(false)}
                    className="px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-primary text-white rounded-xl shadow-md hover:bg-emerald-600 transition-all"
                  >
                    Create Alert
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </PageWrapper>
  );
}
