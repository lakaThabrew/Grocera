import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { AiService } from '../../ai/ai.service';

export abstract class BaseScraper {
  protected browser: Browser;
  protected context: BrowserContext;
  protected page: Page;
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly aiService: AiService,
  ) {}

  async init() {
    this.logger.log('Initializing browser...');
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'],
    });
    this.context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
    });
    this.page = await this.context.newPage();
  }

  async close() {
    this.logger.log('Closing browser...');
    if (this.browser) {
      await this.browser.close();
    }
  }

  protected async getHtml(url: string, waitForSelector?: string): Promise<string> {
    this.logger.log(`Navigating to ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    if (waitForSelector) {
      await this.page.waitForSelector(waitForSelector, { timeout: 15000 });
    } else {
      await this.page.waitForTimeout(2000);
    }
    
    return await this.page.content();
  }

  abstract scrapeCategory(url: string): Promise<void>;
  
  protected async saveProduct(data: {
    storeName: string;
    name: string;
    price: number;
  }) {
    // 1. Normalize the product name using Gemini AI
    this.logger.log(`Normalizing product via AI: ${data.name}`);
    const normalized = await this.aiService.normalizeProduct(data.name);

    // Upsert store
    const store = await this.prisma.store.upsert({
      where: { name: data.storeName },
      update: {},
      create: { name: data.storeName },
    });

    // Upsert product using normalized data
    const product = await this.prisma.product.upsert({
      where: {
        name_storeId: {
          name: normalized.canonicalName,
          storeId: store.id,
        },
      },
      update: {
        brand: normalized.brand,
        weight: normalized.weight,
        canonicalId: normalized.canonicalId,
      },
      create: {
        name: normalized.canonicalName,
        brand: normalized.brand,
        weight: normalized.weight,
        canonicalId: normalized.canonicalId,
        storeId: store.id,
      },
    });

    // Record price history
    await this.prisma.priceHistory.create({
      data: {
        price: data.price,
        productId: product.id,
      },
    });
    
    this.logger.log(`Saved normalized product: ${normalized.canonicalName} (Original: ${data.name}) - Rs ${data.price}`);
  }
}
