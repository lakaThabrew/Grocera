import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ScrapingService } from './scraping.service';
import { PrismaService } from '../prisma.service';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('scraping')
export class ScrapingController {
  constructor(
    private readonly scrapingService: ScrapingService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('trigger')
  async triggerScrape(@Body() body: { store: string; categoryUrl: string }) {
    if (body.store.toLowerCase() !== 'keells') {
      throw new BadRequestException('Store not supported');
    }

    try {
      const url = new URL(body.categoryUrl);
      if (!url.hostname.includes('keellssuper.com')) {
        throw new BadRequestException('Invalid category URL for Keells');
      }
    } catch {
      throw new BadRequestException('Invalid category URL');
    }

    await this.scrapingService.queueCategoryScrape(
      body.store,
      body.categoryUrl,
    );
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
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
