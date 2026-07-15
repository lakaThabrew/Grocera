import { BaseScraper } from './base.scraper';
import * as cheerio from 'cheerio';

export class KeellsScraper extends BaseScraper {
  async scrapeCategory(url: string): Promise<void> {
    const html = await this.getHtml(url);
    const $ = cheerio.load(html);

    // Dummy logic to prove it works since we don't have Keells HTML structure
    const productCards = $('.product-card');

    this.logger.log(`Found ${productCards.length} products`);

    // As an initial test without exact selectors, we just log success.
    // When real HTML structure is known, this will extract properly.
    if (productCards.length === 0) {
      this.logger.warn(
        'No products found; selector may be outdated. No products were saved.',
      );
      return;
    }

    for (const card of productCards) {
      const name = $(card).find('.product-name').text().trim();
      const priceStr = $(card)
        .find('.product-price')
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
