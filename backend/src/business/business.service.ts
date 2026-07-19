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
    const radarData = [];
    
    for (const cat of categories) {
      const allProductsInCategory = await this.prisma.product.findMany({
        where: { categoryId: cat.id, canonicalId: { not: null } },
        include: { prices: { orderBy: { createdAt: 'desc' }, take: 1 } }
      });

      const canonicalGroups: Record<string, number[]> = {};
      for (const p of allProductsInCategory) {
        if (!p.canonicalId || p.prices.length === 0) continue;
        if (!canonicalGroups[p.canonicalId]) canonicalGroups[p.canonicalId] = [];
        
        if (p.storeId !== storeId) {
          canonicalGroups[p.canonicalId].push(p.prices[0].price);
        }
      }

      let ourTotal = 0;
      let compTotal = 0;
      let comparisons = 0;

      for (const p of allProductsInCategory) {
        if (p.storeId === storeId && p.canonicalId && p.prices.length > 0) {
          const compPrices = canonicalGroups[p.canonicalId];
          if (compPrices && compPrices.length > 0) {
            const avgCompPrice = compPrices.reduce((a, b) => a + b, 0) / compPrices.length;
            ourTotal += p.prices[0].price;
            compTotal += avgCompPrice;
            comparisons++;
          }
        }
      }

      let score = 50; 
      const marketAvg = 50; 
      if (comparisons > 0) {
        const ourAvg = ourTotal / comparisons;
        const compAvg = compTotal / comparisons;
        score = Math.min(100, Math.max(0, (compAvg / ourAvg) * 50));
      }
      
      radarData.push({
        category: cat.name,
        ourScore: Math.round(score),
        marketAverage: marketAvg,
      });
    }

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
      
      const products = await this.prisma.product.findMany({
        where: { categoryId: cat.id, canonicalId: { not: null } },
        include: { prices: { orderBy: { createdAt: 'desc' }, take: 1 } }
      });

      for (const comp of competitors) {
        let diffSum = 0;
        let count = 0;

        const ourProducts = products.filter(p => p.storeId === storeId && p.prices.length > 0);
        const compProducts = products.filter(p => p.storeId === comp.id && p.prices.length > 0);

        for (const op of ourProducts) {
          const matchingComp = compProducts.find(cp => cp.canonicalId === op.canonicalId);
          if (matchingComp) {
            const ourPrice = op.prices[0].price;
            const compPrice = matchingComp.prices[0].price;
            const difference = ((compPrice - ourPrice) / compPrice) * 100;
            diffSum += difference;
            count++;
          }
        }

        const avgDifference = count > 0 ? diffSum / count : 0;
        row[comp.name] = Number(avgDifference.toFixed(2));
      }
      
      heatmapData.push(row);
    }

    return {
      competitors: competitors.map(c => c.name),
      data: heatmapData,
    };
  }
}
