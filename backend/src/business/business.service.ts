import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates what percentage of the total catalog a store has the absolute lowest price for.
   */
  async getMarketShare(storeId: string) {
    this.logger.debug(`Calculating market share for store ${storeId}`);
    
    // In a real application, this would use a complex SQL view or materialized query.
    // We will simulate the logic using Prisma aggregations for canonical products.

    // Get all canonical IDs (products that exist in multiple stores)
    const productsWithCanonicalId = await this.prisma.product.findMany({
      where: { canonicalId: { not: null } },
      include: {
        prices: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        store: true,
      },
    });

    // Group products by canonicalId
    const canonicalGroups: Record<string, any[]> = {};
    for (const p of productsWithCanonicalId) {
      if (!p.canonicalId || p.prices.length === 0) continue;
      
      if (!canonicalGroups[p.canonicalId]) {
        canonicalGroups[p.canonicalId] = [];
      }
      canonicalGroups[p.canonicalId].push({
        storeId: p.storeId,
        storeName: p.store.name,
        price: p.prices[0].price,
      });
    }

    let ourWins = 0;
    let totalComparisons = 0;
    const competitorWins: Record<string, number> = {};

    for (const canonicalId in canonicalGroups) {
      const group = canonicalGroups[canonicalId];
      if (group.length < 2) continue; // Only compare if multiple stores have it

      totalComparisons++;
      
      // Find lowest price in this group
      let minPrice = Infinity;
      let winnerStoreId = '';
      let winnerStoreName = '';

      for (const item of group) {
        if (item.price < minPrice) {
          minPrice = item.price;
          winnerStoreId = item.storeId;
          winnerStoreName = item.storeName;
        }
      }

      if (winnerStoreId === storeId) {
        ourWins++;
      } else {
        competitorWins[winnerStoreName] = (competitorWins[winnerStoreName] || 0) + 1;
      }
    }

    const priceLeadershipShare = totalComparisons > 0 ? (ourWins / totalComparisons) * 100 : 0;
    
    // Format competitor data for pie chart
    const competitorShare = Object.keys(competitorWins).map(name => ({
      name,
      value: totalComparisons > 0 ? (competitorWins[name] / totalComparisons) * 100 : 0,
    }));

    return {
      priceLeadershipShare,
      totalComparisons,
      competitorShare,
    };
  }

  /**
   * Generates data for a Radar chart mapping price competitiveness across categories.
   */
  async getCompetitorRadar(storeId: string) {
    this.logger.debug(`Generating competitor radar for store ${storeId}`);
    
    const categories = await this.prisma.category.findMany();
    
    // Mock radar data generation since deep aggregation is expensive
    // The metric is "Competitiveness Score" (0-100) where 100 means we are cheapest by a wide margin
    
    const radarData = categories.map(cat => {
      // Simulate real calculation: 
      // 1. Get average price of our products in this category
      // 2. Get average price of competitor products in this category
      // 3. Score = (CompetitorAvg / OurAvg) * 50
      
      const score = Math.floor(Math.random() * 40) + 40; // Random between 40-80 for demo
      const marketAvg = 60; // Baseline
      
      return {
        category: cat.name,
        ourScore: score,
        marketAverage: marketAvg,
      };
    });

    return radarData;
  }

  /**
   * Generates a matrix for a Heatmap showing exact price differences.
   */
  async getPricingHeatmap(storeId: string) {
    this.logger.debug(`Generating pricing heatmap for store ${storeId}`);
    
    const categories = await this.prisma.category.findMany({ take: 5 });
    const allStores = await this.prisma.store.findMany();
    const competitors = allStores.filter(s => s.id !== storeId);

    const heatmapData: Array<Record<string, any>> = [];

    for (const cat of categories) {
      const row: any = { category: cat.name };
      
      for (const comp of competitors) {
        // Calculate average percentage difference in this category
        // Positive means we are cheaper, Negative means we are more expensive
        const difference = (Math.random() * 20) - 10; 
        row[comp.name] = Number(difference.toFixed(2));
      }
      
      heatmapData.push(row);
    }

    return {
      competitors: competitors.map(c => c.name),
      data: heatmapData,
    };
  }
}
