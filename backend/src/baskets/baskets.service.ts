import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AiService } from '../ai/ai.service';

export interface OptimizedItem {
  itemName: string;
  matchedProduct: string;
  store: string;
  price: number;
}

export interface OptimizationResult {
  strategy: 'SINGLE_STORE' | 'MULTI_STORE';
  totalCost: number;
  totalSavings: number;
  travelCost: number;
  storesToVisit: string[];
  items: OptimizedItem[];
  aiExplanation: string;
  alternative?: {
    strategy: 'SINGLE_STORE' | 'MULTI_STORE';
    totalCost: number;
    storesToVisit: string[];
  };
}

@Injectable()
export class BasketsService {
  private readonly logger = new Logger(BasketsService.name);
  private readonly TRAVEL_COST_PER_EXTRA_STORE = 200;

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async optimizeBasket(shoppingList: string[]): Promise<OptimizationResult> {
    this.logger.log(`Optimizing basket for: ${shoppingList.join(', ')}`);
    
    // 1. Fetch lowest prices for each item across all stores
    const itemPrices: Record<string, OptimizedItem[]> = {};

    for (const item of shoppingList) {
      // Find matching products
      const products = await this.prisma.product.findMany({
        where: {
          name: { contains: item, mode: 'insensitive' },
        },
        include: {
          store: true,
          prices: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      // Filter products that have a price
      const productsWithPrices = products.filter(p => p.prices.length > 0);
      
      // Group by store and find the absolute cheapest product matching this item per store
      const storeBestPrices = new Map<string, OptimizedItem>();
      
      for (const p of productsWithPrices) {
        const storeName = p.store.name;
        const price = p.prices[0].price;
        
        if (!storeBestPrices.has(storeName) || storeBestPrices.get(storeName)!.price > price) {
          storeBestPrices.set(storeName, {
            itemName: item,
            matchedProduct: p.name,
            store: storeName,
            price: price,
          });
        }
      }
      
      itemPrices[item] = Array.from(storeBestPrices.values());
    }

    // 2. Calculate Multi-Store Strategy (Absolute cheapest for each item regardless of store)
    let multiStoreItems: OptimizedItem[] = [];
    let multiStoreTotal = 0;
    const multiStoreSet = new Set<string>();

    for (const item of shoppingList) {
      const options = itemPrices[item];
      if (options && options.length > 0) {
        // Sort to find absolute cheapest
        options.sort((a, b) => a.price - b.price);
        const best = options[0];
        multiStoreItems.push(best);
        multiStoreTotal += best.price;
        multiStoreSet.add(best.store);
      }
    }
    
    // Travel cost: 0 for 1 store, 200 for 2 stores, 400 for 3 stores...
    const multiStoreTravelCost = multiStoreSet.size > 1 ? (multiStoreSet.size - 1) * this.TRAVEL_COST_PER_EXTRA_STORE : 0;
    const multiStoreEffectiveTotal = multiStoreTotal + multiStoreTravelCost;

    // 3. Calculate Single-Store Strategies (Buy everything at one store if possible)
    // Find stores that have ALL items
    const storeCompleteness = new Map<string, number>(); // storeName -> count of items found
    const storeTotals = new Map<string, number>();
    const storeItems = new Map<string, OptimizedItem[]>();

    for (const item of shoppingList) {
      const options = itemPrices[item];
      if (options) {
        for (const opt of options) {
          storeCompleteness.set(opt.store, (storeCompleteness.get(opt.store) || 0) + 1);
          storeTotals.set(opt.store, (storeTotals.get(opt.store) || 0) + opt.price);
          
          if (!storeItems.has(opt.store)) storeItems.set(opt.store, []);
          storeItems.get(opt.store)!.push(opt);
        }
      }
    }

    let bestSingleStoreTotal = Infinity;
    let bestSingleStoreItems: OptimizedItem[] = [];
    let bestSingleStoreName = '';

    for (const [store, count] of storeCompleteness.entries()) {
      // Only consider stores that have ALL items on the list (or the most items if none have all)
      // For simplicity, we just check if it has all items
      if (count === shoppingList.length) {
        const total = storeTotals.get(store)!;
        if (total < bestSingleStoreTotal) {
          bestSingleStoreTotal = total;
          bestSingleStoreItems = storeItems.get(store)!;
          bestSingleStoreName = store;
        }
      }
    }

    // Compare and pick winner
    let winner: 'SINGLE_STORE' | 'MULTI_STORE' = 'SINGLE_STORE';
    let winningItems = bestSingleStoreItems;
    let winningTotal = bestSingleStoreTotal;
    let winningTravelCost = 0;
    let storesToVisit = [bestSingleStoreName];
    
    // If multi-store with travel cost is STILL cheaper than single store, use multi-store
    // Or if no single store had all items (bestSingleStoreTotal is Infinity)
    if (bestSingleStoreTotal === Infinity || multiStoreEffectiveTotal < bestSingleStoreTotal) {
      winner = 'MULTI_STORE';
      winningItems = multiStoreItems;
      winningTotal = multiStoreTotal;
      winningTravelCost = multiStoreTravelCost;
      storesToVisit = Array.from(multiStoreSet);
    }
    
    // Calculate savings
    // Max possible cost if bought at most expensive stores vs our winning strategy
    let maxCost = 0;
    for (const item of shoppingList) {
      const options = itemPrices[item];
      if (options && options.length > 0) {
        maxCost += Math.max(...options.map(o => o.price));
      }
    }
    const savings = maxCost > 0 ? (maxCost - winningTotal) : 0;

    // Build base result
    const result: OptimizationResult = {
      strategy: winner,
      totalCost: winningTotal,
      totalSavings: savings,
      travelCost: winningTravelCost,
      storesToVisit: storesToVisit,
      items: winningItems,
      aiExplanation: '',
    };
    
    // Add alternative for comparison
    if (winner === 'MULTI_STORE' && bestSingleStoreTotal !== Infinity) {
      result.alternative = {
        strategy: 'SINGLE_STORE',
        totalCost: bestSingleStoreTotal,
        storesToVisit: [bestSingleStoreName]
      };
    } else if (winner === 'SINGLE_STORE' && multiStoreSet.size > 1) {
      result.alternative = {
        strategy: 'MULTI_STORE',
        totalCost: multiStoreEffectiveTotal,
        storesToVisit: Array.from(multiStoreSet)
      };
    }

    // 4. Ask AI to explain the result
    const aiExplanation = await this.aiService.generateOptimizationExplanation(shoppingList, result);
    result.aiExplanation = aiExplanation;

    return result;
  }
}
