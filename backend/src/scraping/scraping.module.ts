import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ScrapingService } from './scraping.service';
import { ScrapingController } from './scraping.controller';
import { ScraperProcessor } from './scraper.processor';
import { PrismaModule } from '../prisma.module';
import { AiModule } from '../ai/ai.module';
import { ConsumersModule } from '../consumers/consumers.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'scraping',
    }),
    BullBoardModule.forFeature({
      name: 'scraping',
      adapter: BullMQAdapter,
    }),
    PrismaModule,
    AiModule,
    ConsumersModule,
  ],
  controllers: [ScrapingController],
  providers: [ScrapingService, ScraperProcessor],
  exports: [ScrapingService],
})
export class ScrapingModule {}
