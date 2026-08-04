import { BaseScraper } from './base.scraper';
import * as cheerio from 'cheerio';

export class CargillsScraper extends BaseScraper {
  async scrapeCategory(url: string): Promise<void> {
    const html = await this.getHtml(url);
    const $ = cheerio.load(html);

    const productCards = $('.cargillProd1');

    this.logger.log(`Found ${productCards.length} products on Cargills`);

    if (productCards.length === 0) {
      this.logger.warn(
        'No products found; selector may be outdated. No products were saved.',
      );
      return;
    }

    for (const card of productCards) {
      const name = $(card).find('.veg p').text().trim();
      const priceStr = $(card)
        .find('.strike1 h4')
        .text()
        .replace(/[^\d.]/g, '');
      const price = parseFloat(priceStr);

      if (name && !isNaN(price)) {
        await this.saveProduct({
          storeName: 'Cargills',
          name,
          price,
        });
      }
    }
  }
}
