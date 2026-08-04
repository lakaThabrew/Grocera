"use client";

import {
  Activity,
  CreditCard,
  DollarSign,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  TrendingUp,
  ShoppingBag,
  ShoppingBasket,
  Tag,
  Bot,
  Store,
  Briefcase,
  ArrowRight,
  Shield,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { motion, Variants } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

const revenueData = [
  { name: "Mon", total: 1200 },
  { name: "Tue", total: 2100 },
  { name: "Wed", total: 800 },
  { name: "Thu", total: 1600 },
  { name: "Fri", total: 900 },
  { name: "Sat", total: 1700 },
  { name: "Sun", total: 2400 },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const role = user?.role || "CONSUMER";

  // Render ADMIN Dashboard
  if (role === "ADMIN") {
    return (
      <PageWrapper>
        {/* Admin Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full rounded-3xl overflow-hidden shadow-2xl mb-6 group border border-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-emerald-950/80" />
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-lime-400/20 rounded-full blur-3xl animate-glow-pulse" />

          <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-lime-300 text-xs font-semibold mb-3 backdrop-blur-md">
                <Shield className="w-3.5 h-3.5 text-lime-400" /> System
                Administrator Console
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3 leading-tight">
                Scraper Engine & Admin Hub
              </h1>
              <p className="text-white/80 text-sm md:text-base leading-relaxed">
                Monitor system metrics, Playwright queue workers, total
                subscriptions, and active price scrapes.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl text-white shadow-xl shrink-0">
              <div className="p-3 bg-primary/20 rounded-xl text-lime-300">
                <TrendingUp className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="text-xs text-white/70 uppercase tracking-wider font-semibold">
                  Engine Health
                </div>
                <div className="text-lg font-bold text-white flex items-center gap-2">
                  4 Supermarkets Syncing{" "}
                  <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Admin Stat Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6"
        >
          {[
            {
              title: "System Revenue",
              value: "Rs. 4.52M",
              icon: DollarSign,
              trend: "+20.1%",
              positive: true,
              color: "from-emerald-500/20 to-primary/10",
            },
            {
              title: "Active Platform Users",
              value: "+2,350",
              icon: Users,
              trend: "+180.1%",
              positive: true,
              color: "from-blue-500/20 to-cyan-500/10",
            },
            {
              title: "Total Baskets Optimized",
              value: "+12,234",
              icon: CreditCard,
              trend: "+19%",
              positive: true,
              color: "from-purple-500/20 to-indigo-500/10",
            },
            {
              title: "Active Price Scrapes",
              value: "573",
              icon: Activity,
              trend: "-4%",
              positive: false,
              color: "from-amber-500/20 to-orange-500/10",
            },
          ].map((card, i) => (
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              key={i}
              className="glass-card-glow rounded-2xl p-6 border border-border/80 shadow-lg hover:shadow-2xl"
            >
              <div className="flex flex-row items-center justify-between pb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {card.title}
                </h3>
                <div
                  className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} text-primary border border-primary/20`}
                >
                  <card.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="pt-1">
                <div className="text-3xl font-extrabold text-foreground tracking-tight">
                  {card.value}
                </div>
                <div
                  className={`text-xs mt-2 flex items-center font-bold px-2 py-0.5 rounded-full w-fit ${
                    card.positive
                      ? "bg-primary/15 text-primary"
                      : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {card.positive ? (
                    <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
                  )}
                  {card.trend} vs last week
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts & Scrape Logs */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
          <div className="col-span-1 lg:col-span-4 rounded-2xl glass-card p-6 shadow-xl border border-border/80">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Platform Revenue & Usage
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Weekly system metrics
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                Live Data
              </span>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="name"
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
                    tickFormatter={(v) => `$${v}`}
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
                    dataKey="total"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-3 rounded-2xl glass-card p-6 flex flex-col shadow-xl border border-border/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">
                Scraper Dispatch Log
              </h3>
              <Link
                href="/scraper"
                className="text-xs text-primary font-bold hover:underline"
              >
                Open Dispatcher &rarr;
              </Link>
            </div>

            <div className="space-y-3 flex-1">
              {[
                {
                  store: "Keells",
                  item: "Samba Rice 5kg",
                  change: "-Rs. 120.00",
                  time: "2m ago",
                  positive: true,
                },
                {
                  store: "Cargills",
                  item: "Anchor Milk Powder",
                  change: "+Rs. 50.00",
                  time: "15m ago",
                  positive: false,
                },
                {
                  store: "Arpico",
                  item: "Fresh Apples 1kg",
                  change: "Rs. 0.00",
                  time: "1h ago",
                  positive: null,
                },
                {
                  store: "Glomark",
                  item: "Olive Oil 500ml",
                  change: "+Rs. 200.00",
                  time: "3h ago",
                  positive: false,
                },
              ].map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-card/60 border border-border/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <Activity className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {activity.item}
                      </p>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {activity.store} • {activity.time}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                      activity.positive === true
                        ? "bg-primary/15 text-primary"
                        : activity.positive === false
                          ? "bg-destructive/15 text-destructive"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {activity.change}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Render BUSINESS Dashboard
  if (role === "BUSINESS") {
    return (
      <PageWrapper>
        {/* Business Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full rounded-3xl overflow-hidden shadow-2xl mb-6 border border-white/10"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-slate-900/90 to-primary/30" />
          <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-lime-300 text-xs font-semibold mb-3">
                <Briefcase className="w-3.5 h-3.5 text-lime-400" /> B2B
                Supermarket Intelligence Portal
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3 leading-tight">
                Market Leadership Analytics
              </h1>
              <p className="text-white/80 text-sm md:text-base leading-relaxed">
                Track competitor pricing matrices, price leadership shares, and
                category competitiveness in real-time.
              </p>
            </div>

            <Link
              href="/business"
              className="px-6 py-3 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              Launch B2B Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Business KPI Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="glass-card p-6 rounded-2xl border border-border/80">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">
              Price Leadership Share
            </p>
            <h2 className="text-4xl font-extrabold text-primary">34.2%</h2>
            <p className="text-xs text-muted-foreground mt-2">
              Ranked #1 in Dairy & Grains categories
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-border/80">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">
              Competitor Match Rate
            </p>
            <h2 className="text-4xl font-extrabold text-foreground">
              1,420 Items
            </h2>
            <p className="text-xs text-muted-foreground mt-2">
              Matching products across 4 competitors
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-border/80">
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">
              Avg Price Delta
            </p>
            <h2 className="text-4xl font-extrabold text-emerald-500">-3.4%</h2>
            <p className="text-xs text-muted-foreground mt-2">
              We are 3.4% cheaper than market avg
            </p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Render CONSUMER (Normal User / Default) Home Dashboard
  return (
    <PageWrapper>
      {/* Consumer Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl mb-8 group border border-white/10"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-emerald-950/90 to-black/70" />
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-lime-400/20 rounded-full blur-3xl animate-glow-pulse" />
        <div className="absolute bottom-0 right-1/3 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl animate-float-slow" />

        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-lime-300 text-xs font-semibold mb-3 backdrop-blur-md">
              <Sparkles
                className="w-3.5 h-3.5 text-lime-400 animate-spin"
                style={{ animationDuration: "6s" }}
              />{" "}
              Sri Lanka&apos;s #1 Grocery Price Engine
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-3 leading-tight">
              Smart Grocery Shopping with{" "}
              <span className="text-gradient">Grocera</span>
            </h1>

            <p className="text-white/80 text-sm md:text-base leading-relaxed">
              Compare prices live across Keells, Cargills Food City, Arpico
              Supercentre & Glomark. Never overpay on groceries again.
            </p>

            <div className="flex flex-wrap gap-3 mt-6">
              <Link
                href="/products"
                className="px-5 py-2.5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/25 hover:shadow-xl transition-all flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Browse Catalog
              </Link>
              <Link
                href="/baskets"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl font-bold text-sm backdrop-blur-md transition-all flex items-center gap-2"
              >
                <ShoppingBasket className="w-4 h-4 text-lime-300" /> Optimize
                Basket
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl text-white shadow-xl shrink-0">
            <div className="p-3.5 bg-primary/20 rounded-xl text-lime-300">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs text-white/70 uppercase tracking-wider font-semibold">
                Active Supermarkets
              </div>
              <div className="text-lg font-extrabold text-white flex items-center gap-2 mt-0.5">
                4 Retailers{" "}
                <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-ping" />
              </div>
              <p className="text-[10px] text-lime-300 font-bold mt-1">
                Keells • Cargills • Arpico • Glomark
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feature Navigation Grid for Consumers */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-3 mb-8"
      >
        <motion.div
          variants={itemVariants}
          className="glass-card rounded-2xl p-6 border border-border/80 shadow-xl hover:border-primary/40 transition-all group"
        >
          <div className="p-3 bg-primary/10 rounded-xl w-fit text-primary mb-4 group-hover:scale-110 transition-transform">
            <ShoppingBasket className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            AI Basket Optimizer
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            Type your grocery list and let AI calculate the cheapest store
            combination to maximize your savings.
          </p>
          <Link
            href="/baskets"
            className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
          >
            Try Basket AI &rarr;
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="glass-card rounded-2xl p-6 border border-border/80 shadow-xl hover:border-primary/40 transition-all group"
        >
          <div className="p-3 bg-emerald-500/10 rounded-xl w-fit text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            Today&apos;s Deals & Discounts
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            Discover active price drop promotions, discount vouchers, and daily
            supermarket offers across Sri Lanka.
          </p>
          <Link
            href="/discounts"
            className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
          >
            View Active Deals &rarr;
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="glass-card rounded-2xl p-6 border border-border/80 shadow-xl hover:border-primary/40 transition-all group"
        >
          <div className="p-3 bg-purple-500/10 rounded-xl w-fit text-purple-500 mb-4 group-hover:scale-110 transition-transform">
            <Bot className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">
            Grocera AI Concierge
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-4">
            Ask our Google Gemini shopping assistant to instantly compare
            prices, recommend brands, or spot deals.
          </p>
          <Link
            href="/assistant"
            className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
          >
            Ask AI Assistant &rarr;
          </Link>
        </motion.div>
      </motion.div>

      {/* Recent Market Price Drops */}
      <div className="glass-card rounded-3xl p-6 border border-border/80 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Recent Supermarket Price Drops
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time price changes detected across stores
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-primary hover:underline"
          >
            View All Products &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              store: "Keells",
              item: "Samba Rice 5kg Premium",
              oldPrice: "Rs. 1,250",
              newPrice: "Rs. 1,050",
              save: "Rs. 200 OFF",
            },
            {
              store: "Cargills",
              item: "Anchor Full Cream Milk 400g",
              oldPrice: "Rs. 1,100",
              newPrice: "Rs. 950",
              save: "Rs. 150 OFF",
            },
            {
              store: "Arpico",
              item: "Ceylon Black Tea Bags 100s",
              oldPrice: "Rs. 850",
              newPrice: "Rs. 680",
              save: "Rs. 170 OFF",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/40 transition-all flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
                  {item.store}
                </span>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {item.item}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground line-through">
                    {item.oldPrice}
                  </span>
                  <span className="text-sm font-extrabold text-emerald-500">
                    {item.newPrice}
                  </span>
                </div>
              </div>
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                {item.save}
              </span>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
