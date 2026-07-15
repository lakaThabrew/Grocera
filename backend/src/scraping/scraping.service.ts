import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(
    @InjectQueue('scraping') private scrapingQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async queueCategoryScrape(store: string, categoryUrl: string) {
    this.logger.log(`Queueing category scrape for ${store}: ${categoryUrl}`);

    const dbJob = await this.prisma.job.create({
      data: {
        name: `Scrape ${store} - ${categoryUrl}`,
        status: 'PENDING',
      },
    });

    await this.scrapingQueue.add(
      'scrape-category',
      {
        dbJobId: dbJob.id,
        store,
        categoryUrl,
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );
  }
}
