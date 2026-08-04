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
@Controller('scraping')
export class ScrapingController {
  constructor(
    private readonly scrapingService: ScrapingService,
    private readonly prisma: PrismaService,
  ) {}

  @Roles(Role.ADMIN)
  @Post('trigger')
  async triggerScrape(@Body() body: { store: string; categoryUrl: string }) {
    const store = body.store ? body.store.toLowerCase() : '';
    const supportedStores = ['keells', 'cargills', 'arpico', 'glomark'];
    if (!supportedStores.includes(store)) {
      throw new BadRequestException(
        'Store not supported. Choose Keells, Cargills, Arpico, or Glomark.',
      );
    }

    try {
      new URL(body.categoryUrl);
    } catch {
      throw new BadRequestException('Invalid category URL');
    }

    await this.scrapingService.queueCategoryScrape(
      body.store,
      body.categoryUrl,
    );
    return { message: `Scraping job for ${body.store} queued successfully!` };
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
