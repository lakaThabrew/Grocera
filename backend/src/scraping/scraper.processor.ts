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

  async process(
    job: Job<{ dbJobId?: string; store: string; categoryUrl: string }>,
  ): Promise<any> {
    this.logger.log(`Processing job ${String(job.id)} of type ${job.name}`);

    if (job.name === 'scrape-category') {
      const { dbJobId, store, categoryUrl } = job.data;

      if (dbJobId) {
        await this.prisma.job.update({
          where: { id: dbJobId },
          data: { status: 'RUNNING', startedAt: new Date() },
        });
      }

      let scraper: KeellsScraper | undefined;

      try {
        // Simple Factory based on store
        if (store.toLowerCase() === 'keells') {
          scraper = new KeellsScraper(this.prisma, this.aiService);
        } else {
          throw new Error(`Store ${store} not supported yet`);
        }

        await scraper.init();
        await scraper.scrapeCategory(categoryUrl);

        if (dbJobId) {
          await this.prisma.job.update({
            where: { id: dbJobId },
            data: {
              status: 'COMPLETED',
              endedAt: new Date(),
              result: 'Scrape completed successfully',
            },
          });
        }
      } catch (error: unknown) {
        this.logger.error(`Scraping failed for ${store}`, error);

        if (dbJobId) {
          await this.prisma.job.update({
            where: { id: dbJobId },
            data: {
              status: 'FAILED',
              endedAt: new Date(),
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          });
        }

        throw error;
      } finally {
        if (scraper) {
          await scraper.close();
        }
      }
    }
  }
}
