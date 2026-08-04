"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { exportToCSV, exportElementToPDF } from "@/lib/exportUtils";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Download,
  FileText,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";

// Mock Data Interfaces
interface MarketInflation {
  period: string;
  inflationRate: number;
  trend: "UP" | "DOWN" | "STABLE";
  categoryBreakdown: Array<{ category: string; rate: number }>;
  historicalIndex: Array<{ date: string; indexValue: number }>;
}

export default function AnalyticsPage() {
  const [marketData, setMarketData] = useState<MarketInflation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/analytics/inflation");
        setMarketData(res.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    if (marketData?.historicalIndex) {
      exportToCSV(marketData.historicalIndex, "market_inflation_data");
    }
  };

  const handleExportPDF = () => {
    exportElementToPDF("analytics-dashboard", "Grocera_Market_Analytics");
  };

  if (isLoading) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </PageWrapper>
    );
  }

  if (!marketData) {
    return (
      <PageWrapper>
        <div className="text-center text-muted-foreground p-12 glass-card rounded-xl">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Failed to load analytics data.</p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="max-w-6xl mx-auto w-full">
      <div id="analytics-dashboard" className="space-y-6 pb-12">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Market Analytics
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Macro-level insights, inflation tracking, and historical trends.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-muted/50 hover:bg-muted text-foreground rounded-md border border-border transition-colors"
            >
              <Download className="h-4 w-4" /> CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors shadow-sm"
            >
              <FileText className="h-4 w-4" /> Export PDF
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 rounded-xl relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 opacity-5">
              <Activity className="h-24 w-24" />
            </div>
            <p className="text-sm text-muted-foreground font-medium mb-1">
              Market Inflation (6M)
            </p>
            <div className="flex items-end gap-3">
              <h2 className="text-4xl font-bold tracking-tight">
                {marketData.inflationRate > 0 ? "+" : ""}
                {marketData.inflationRate}%
              </h2>
              <span
                className={`flex items-center text-sm font-medium mb-1 ${
                  marketData.trend === "UP"
                    ? "text-destructive"
                    : "text-emerald-500"
                }`}
              >
                {marketData.trend === "UP" ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {marketData.trend}
              </span>
            </div>
          </motion.div>

          {marketData.categoryBreakdown.slice(0, 2).map((cat, i) => (
            <motion.div
              key={cat.category}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + (i + 1) * 0.1 }}
              className="glass-card p-6 rounded-xl"
            >
              <p className="text-sm text-muted-foreground font-medium mb-1">
                {cat.category} Inflation
              </p>
              <div className="flex items-end gap-3">
                <h2 className="text-3xl font-bold text-foreground/90">
                  {cat.rate > 0 ? "+" : ""}
                  {cat.rate}%
                </h2>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Trend Area Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 glass-card p-6 rounded-xl"
          >
            <h3 className="font-semibold text-lg mb-6">Price Index Trend</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={marketData.historicalIndex}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={["dataMin - 5", "dataMax + 5"]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="indexValue"
                    name="Price Index"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorIndex)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Category Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 rounded-xl"
          >
            <h3 className="font-semibold text-lg mb-6">By Category</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={marketData.categoryBreakdown}
                  layout="vertical"
                  margin={{ top: 0, right: 0, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    hide
                  />
                  <YAxis
                    dataKey="category"
                    type="category"
                    stroke="hsl(var(--foreground))"
                    fontSize={13}
                    fontWeight={500}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.2 }}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="rate"
                    name="Inflation %"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
