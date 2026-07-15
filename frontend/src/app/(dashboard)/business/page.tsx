"use client"

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useAuthStore } from '@/store/useAuthStore';
import { exportToCSV } from '@/lib/exportUtils';
import { motion } from 'framer-motion';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { Briefcase, Download, Percent, ShieldCheck, Target, TrendingUp, SearchX } from 'lucide-react';

interface MarketShare {
  priceLeadershipShare: number;
  totalComparisons: number;
  competitorShare: Array<{ name: string; value: number }>;
}

interface RadarData {
  category: string;
  ourScore: number;
  marketAverage: number;
}

interface HeatmapData {
  competitors: string[];
  data: Record<string, string | number>[];
}

export default function BusinessDashboard() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [marketShare, setMarketShare] = useState<MarketShare | null>(null);
  const [radarData, setRadarData] = useState<RadarData[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);

  useEffect(() => {
    if (user?.role === 'BUSINESS') {
      fetchBusinessData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchBusinessData = async () => {
    // In a real app, the storeId would be fetched from the BUSINESS user's profile
    // For demo purposes, we'll hardcode a dummy store ID
    const dummyStoreId = '12345';
    
    try {
      const [shareRes, radarRes, heatmapRes] = await Promise.all([
        api.get(`/business/market-share/${dummyStoreId}`),
        api.get(`/business/radar/${dummyStoreId}`),
        api.get(`/business/heatmap/${dummyStoreId}`),
      ]);

      setMarketShare(shareRes.data);
      setRadarData(radarRes.data);
      setHeatmap(heatmapRes.data);
    } catch (error) {
      console.error('Failed to fetch business data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getHeatmapColor = (value: number) => {
    if (value === 0) return 'bg-muted text-muted-foreground';
    if (value > 0) return 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30';
    return 'bg-destructive/20 text-destructive border border-destructive/30';
  };

  if (isLoading) {
    return (
      <PageWrapper className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </PageWrapper>
    );
  }

  if (user?.role !== 'BUSINESS') {
    return (
      <PageWrapper>
        <div className="text-center p-16 glass-card rounded-xl border border-dashed border-destructive/30 max-w-2xl mx-auto">
          <ShieldCheck className="h-16 w-16 mx-auto text-destructive mb-6" />
          <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground mt-2">
            The Business Dashboard is exclusively available to registered supermarket partners.
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">B2B Analytics Portal</h1>
            <p className="text-muted-foreground mt-1">
              Deep competitor analysis and price leadership matrices.
            </p>
          </div>
        </div>
        <button 
          onClick={() => heatmap && exportToCSV(heatmap.data, 'Competitor_Heatmap')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors shadow-sm font-medium"
        >
          <Download className="h-4 w-4" /> Export Matrix
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Market Share KPI */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-xl relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 opacity-5">
            <Target className="h-32 w-32" />
          </div>
          <p className="text-sm text-muted-foreground font-medium mb-2 uppercase tracking-wider">Price Leadership Share</p>
          <div className="flex items-end gap-2">
            <h2 className="text-5xl font-bold text-primary">
              {marketShare?.priceLeadershipShare.toFixed(1)}%
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Based on {marketShare?.totalComparisons} matching canonical products
          </p>
        </motion.div>

        {/* Competitor Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 glass-card p-6 rounded-xl"
        >
          <p className="text-sm text-muted-foreground font-medium mb-4 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> Market Share Distribution
          </p>
          <div className="flex flex-wrap gap-4">
            {marketShare?.competitorShare.map(comp => (
              <div key={comp.name} className="flex-1 min-w-[120px] bg-muted/30 p-4 rounded-lg border border-border">
                <p className="text-sm font-semibold">{comp.name}</p>
                <p className="text-2xl font-bold text-foreground/80 mt-1">{comp.value.toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-xl min-h-[400px] flex flex-col"
        >
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Radar className="h-5 w-5 text-primary" /> Category Competitiveness
          </h3>
          <div className="flex-1 w-full min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="category" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                />
                <Legend />
                <Radar name="Our Store Score" dataKey="ourScore" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.5} />
                <Radar name="Market Average" dataKey="marketAverage" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pricing Heatmap (CSS Grid) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 rounded-xl overflow-x-auto"
        >
          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
            <Percent className="h-5 w-5 text-primary" /> Pricing Delta Matrix
          </h3>
          
          {heatmap ? (
            <div className="min-w-[600px]">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Category</th>
                    {heatmap.competitors.map(comp => (
                      <th key={comp} className="px-4 py-3 text-center">{comp}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmap.data.map((row, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="px-4 py-4 font-medium">{row.category}</td>
                      {heatmap.competitors.map(comp => {
                        const val = row[comp];
                        const numericVal = Number(val);
                        return (
                          <td key={comp} className="px-2 py-2">
                            <div className={`w-full py-2 px-1 text-center rounded font-semibold ${getHeatmapColor(numericVal)}`}>
                              {numericVal > 0 ? '+' : ''}{numericVal}%
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center gap-6 mt-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500/50"></div> We are cheaper</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-destructive/50"></div> We are more expensive</div>
              </div>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <SearchX className="h-8 w-8 mr-2 opacity-50" /> No competitors found
            </div>
          )}
        </motion.div>
      </div>
    </PageWrapper>
  );
}
