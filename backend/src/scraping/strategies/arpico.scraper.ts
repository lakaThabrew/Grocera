import { BaseScraper } from './base.scraper';
import * as cheerio from 'cheerio';

export class ArpicoScraper extends BaseScraper {
  async scrapeCategory(url: string): Promise<void> {
    const html = await this.getHtml(url);
    const $ = cheerio.load(html);

    const productCards = $('.product-layout');

    this.logger.log(`Found ${productCards.length} products on Arpico`);

    if (productCards.length === 0) {
      this.logger.warn(
        'No products found; selector may be outdated. No products were saved.',
      );
      return;
    }

    for (const card of productCards) {
      const name = $(card).find('.product-title a').text().trim();
      let priceStr = $(card).find('.price .price-new').text().trim();
      if (!priceStr) {
        priceStr = $(card).find('.price').text().trim();
      }
      priceStr = priceStr.replace(/[^\d.]/g, '');
      const price = parseFloat(priceStr);

      if (name && !isNaN(price)) {
        await this.saveProduct({
          storeName: 'Arpico',
          name,
          price,
        });
      }
    }
  }
}
