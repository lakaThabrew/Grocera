import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AiService } from '../ai/ai.service';
import { KeellsScraper } from './strategies/keells.scraper';

@Processor('scraping')
export class ScraperProcessor extends WorkerHost {
  private readonly logger = new Logger(ScraperProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    if (job.name === 'scrape-category') {
      const { dbJobId, store, categoryUrl } = job.data;

      if (dbJobId) {
        await this.prisma.job.update({
          where: { id: dbJobId },
          data: { status: 'RUNNING', startedAt: new Date() }
        });
      }

      // Simple Factory based on store
      let scraper;
      if (store.toLowerCase() === 'keells') {
        scraper = new KeellsScraper(this.prisma, this.aiService);
      } else {
        throw new Error(`Store ${store} not supported yet`);
      }

      try {
        await scraper.init();
        await scraper.scrapeCategory(categoryUrl);

        if (dbJobId) {
          await this.prisma.job.update({
            where: { id: dbJobId },
            data: { status: 'COMPLETED', endedAt: new Date(), result: 'Scrape completed successfully' }
          });
        }
      } catch (error: any) {
        this.logger.error(`Scraping failed for ${store}`, error);
        
        if (dbJobId) {
          await this.prisma.job.update({
            where: { id: dbJobId },
            data: { status: 'FAILED', endedAt: new Date(), error: error.message || 'Unknown error' }
          });
        }
        
        throw error;
      } finally {
        await scraper.close();
      }
    }
  }
}
