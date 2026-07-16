import { BaseScraper } from './base.scraper';
import * as cheerio from 'cheerio';

export class KeellsScraper extends BaseScraper {
  async scrapeCategory(url: string): Promise<void> {
    const html = await this.getHtml(url);
    const $ = cheerio.load(html);

    const productCards = $('.product-card-containerV2');

    this.logger.log(`Found ${productCards.length} products`);

    if (productCards.length === 0) {
      this.logger.warn(
        'No products found; selector may be outdated. No products were saved.',
      );
      return;
    }

    for (const card of productCards) {
      const name = $(card).find('.product-card-nameV2').text().trim();
      const priceStr = $(card)
        .find('.product-card-final-priceV2')
        .text()
        .replace(/[^\d.]/g, '');
      const price = parseFloat(priceStr);

      if (name && !isNaN(price)) {
        await this.saveProduct({
          storeName: 'Keells',
          name,
          price,
        });
      }
    }
  }
}
