import { Controller, Post, Body, Get } from '@nestjs/common';
import { ScrapingService } from './scraping.service';
import { PrismaService } from '../prisma.service';
import { Role } from '@prisma/client';

@Controller('scraping')
export class ScrapingController {
  constructor(
    private readonly scrapingService: ScrapingService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('trigger')
  async triggerScrape(@Body() body: { store: string; categoryUrl: string }) {
    await this.scrapingService.queueCategoryScrape(body.store, body.categoryUrl);
    return { message: 'Scraping job queued successfully' };
  }

  @Get('products')
  async getScrapedProducts() {
    return this.prisma.product.findMany({
      include: {
        store: true,
        prices: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
