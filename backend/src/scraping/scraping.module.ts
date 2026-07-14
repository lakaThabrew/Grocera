import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScrapingService } from './scraping.service';
import { ScrapingController } from './scraping.controller';
import { ScraperProcessor } from './scraper.processor';
import { PrismaModule } from '../prisma.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'scraping',
    }),
    PrismaModule,
    AiModule,
  ],
  controllers: [ScrapingController],
  providers: [ScrapingService, ScraperProcessor],
  exports: [ScrapingService],
})
export class ScrapingModule {}
