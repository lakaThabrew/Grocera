import { BaseScraper } from './base.scraper';
import * as cheerio from 'cheerio';

export class GlomarkScraper extends BaseScraper {
  async scrapeCategory(url: string): Promise<void> {
    const html = await this.getHtml(url);
    const $ = cheerio.load(html);

    const productCards = $('.product-box');

    this.logger.log(`Found ${productCards.length} products on Glomark`);

    if (productCards.length === 0) {
      this.logger.warn(
        'No products found; selector may be outdated. No products were saved.',
      );
      return;
    }

    for (const card of productCards) {
      const name = $(card).find('.product-title').text().trim();
      let priceStr = $(card).find('.price strong.clr-txt').text().trim();

      // Fallback if the strong tag isn't there (e.g. non-discounted items)
      if (!priceStr) {
        // Only take the first text node to avoid getting both new and old prices mashed together if structure differs
        priceStr = $(card).find('.price').contents().first().text().trim();
      }

      priceStr = priceStr.replace(/[^\d.]/g, '');
      const price = parseFloat(priceStr);

      if (name && !isNaN(price)) {
        await this.saveProduct({
          storeName: 'Glomark',
          name,
          price,
        });
      }
    }
  }
}
