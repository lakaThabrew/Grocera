import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface ProductAnalytics {
  productId: string;
  currentPrice: number;
  highestPrice: number;
  lowestPrice: number;
  averagePrice: number;
  priceVolatility: number; // percentage variance
  predictionNextWeek: number; // simple projection
  history: Array<{ date: string; price: number }>;
}

export interface MarketInflation {
  period: string; // e.g., '1M', '3M', '6M', '1Y'
  inflationRate: number; // percentage change
  trend: 'UP' | 'DOWN' | 'STABLE';
  categoryBreakdown: Array<{ category: string; rate: number }>;
  historicalIndex: Array<{ date: string; indexValue: number }>;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getProductAnalytics(productId: string): Promise<ProductAnalytics> {
    this.logger.debug(`Fetching analytics for product ${productId}`);

    const history = await this.prisma.priceHistory.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
    });

    if (history.length === 0) {
      return {
        productId,
        currentPrice: 0,
        highestPrice: 0,
        lowestPrice: 0,
        averagePrice: 0,
        priceVolatility: 0,
        predictionNextWeek: 0,
        history: [],
      };
    }

    const prices = history.map((h) => h.price);
    const currentPrice = prices[prices.length - 1];
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;

    // Volatility: standard deviation / mean
    const variance =
      prices.reduce((acc, val) => acc + Math.pow(val - averagePrice, 2), 0) /
      prices.length;
    const stdDev = Math.sqrt(variance);
    const priceVolatility = (stdDev / averagePrice) * 100;

    // Simple prediction: Moving average of last 3 points
    const recentPrices = prices.slice(-3);
    const predictionNextWeek =
      recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;

    const historyData = history.map((h) => ({
      date: h.createdAt.toISOString().split('T')[0],
      price: h.price,
    }));

    return {
      productId,
      currentPrice,
      highestPrice,
      lowestPrice,
      averagePrice,
      priceVolatility,
      predictionNextWeek,
      history: historyData,
    };
  }

  async getMarketInflation(): Promise<MarketInflation> {
    this.logger.debug('Calculating market inflation trends');

    // In a real production system, this would involve complex SQL aggregations over the entire DB.
    // For this implementation, we will simulate a market index based on recent price histories.

    const historicalIndex: Array<{ date: string; indexValue: number }> = [];
    let baseIndex = 100;
    let previousMonthAvg = 0;

    for (let i = 6; i >= 0; i--) {
      const startOfMonth = new Date();
      startOfMonth.setMonth(startOfMonth.getMonth() - i, 1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);

      const result = await this.prisma.priceHistory.aggregate({
        where: {
          createdAt: {
            gte: startOfMonth,
            lt: endOfMonth,
          },
        },
        _avg: { price: true },
      });

      const currentMonthAvg = result._avg.price || previousMonthAvg || 100;

      if (i === 6) {
        baseIndex = 100;
      } else if (previousMonthAvg > 0) {
        const change =
          ((currentMonthAvg - previousMonthAvg) / previousMonthAvg) * 100;
        baseIndex = baseIndex * (1 + change / 100);
      }

      previousMonthAvg = currentMonthAvg;

      historicalIndex.push({
        date: `${startOfMonth.toLocaleString('default', { month: 'short' })} ${startOfMonth.getFullYear()}`,
        indexValue: Number(baseIndex.toFixed(2)),
      });
    }

    const startValue = historicalIndex[0].indexValue;
    const endValue = historicalIndex[historicalIndex.length - 1].indexValue;
    const inflationRate = ((endValue - startValue) / startValue) * 100;

    const categories = await this.prisma.category.findMany({ take: 3 });
    const categoryBreakdown: Array<{ category: string; rate: number }> = [];

    for (const cat of categories) {
      const oldPrices = await this.prisma.priceHistory.aggregate({
        where: {
          product: { categoryId: cat.id },
          createdAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _avg: { price: true },
      });
      const newPrices = await this.prisma.priceHistory.aggregate({
        where: {
          product: { categoryId: cat.id },
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        _avg: { price: true },
      });

      const oldAvg = oldPrices._avg.price || 1;
      const newAvg = newPrices._avg.price || oldAvg;
      const rate = ((newAvg - oldAvg) / oldAvg) * 100;

      categoryBreakdown.push({
        category: cat.name,
        rate: Number(rate.toFixed(2)),
      });
    }

    return {
      period: '6M',
      inflationRate: Number(inflationRate.toFixed(2)),
      trend: inflationRate > 1 ? 'UP' : inflationRate < -1 ? 'DOWN' : 'STABLE',
      categoryBreakdown,
      historicalIndex,
    };
  }
}
