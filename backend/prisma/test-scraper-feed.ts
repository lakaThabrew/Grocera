import { PrismaClient } from '@prisma/client';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('TestScraperFeed');

async function testScraperDatabaseFeed() {
  logger.log('--- TESTING SCRAPER DATABASE FEED PIPELINE ---');

  const scrapedItems = [
    {
      storeName: 'Keells',
      rawName: 'KEELLS Premium Samba Rice 5kg Pack',
      brand: 'Keells',
      weight: '5kg',
      price: 1020.00,
    },
    {
      storeName: 'Cargills',
      rawName: 'Anchor Full Cream Milk Powder 400g Foil Pack',
      brand: 'Anchor',
      weight: '400g',
      price: 940.00,
    },
    {
      storeName: 'Arpico',
      rawName: 'Dilmah Pure Ceylon Black Tea 100 Tea Bags 200g',
      brand: 'Dilmah',
      weight: '200g',
      price: 660.00,
    },
    {
      storeName: 'Glomark',
      rawName: 'Borges Extra Virgin Olive Oil 500ml Glass Bottle',
      brand: 'Borges',
      weight: '500ml',
      price: 3150.00,
    },
  ];

  for (const item of scrapedItems) {
    logger.log(`Processing Scraped Product: [${item.storeName}] ${item.rawName} @ Rs. ${item.price}`);

    // 1. Store Upsert
    const store = await prisma.store.upsert({
      where: { name: item.storeName },
      update: {},
      create: { name: item.storeName, url: `https://www.${item.storeName.toLowerCase()}.com` },
    });

    // 2. Product Upsert with Canonical Matching
    const product = await prisma.product.upsert({
      where: {
        name_storeId: {
          name: item.rawName,
          storeId: store.id,
        },
      },
      update: {
        brand: item.brand,
        weight: item.weight,
        canonicalId: `CANONICAL-${item.brand.toUpperCase()}-${item.weight.toUpperCase()}`,
      },
      create: {
        name: item.rawName,
        brand: item.brand,
        weight: item.weight,
        canonicalId: `CANONICAL-${item.brand.toUpperCase()}-${item.weight.toUpperCase()}`,
        storeId: store.id,
      },
    });

    // 3. Price History Entry
    const priceEntry = await prisma.priceHistory.create({
      data: {
        price: item.price,
        currency: 'Rs.',
        productId: product.id,
      },
    });

    logger.log(`✅ SUCCESS: Inserted Product ID "${product.id}" with Price Entry ID "${priceEntry.id}" (Rs. ${priceEntry.price}) into Database!\n`);
  }

  // Verification Query
  const totalProducts = await prisma.product.count();
  const totalStores = await prisma.store.count();
  const totalPrices = await prisma.priceHistory.count();

  console.log('\n========================================');
  console.log(`📊 DATABASE FEED VERIFICATION SUMMARY`);
  console.log(`- Total Stores in DB: ${totalStores}`);
  console.log(`- Total Products in DB: ${totalProducts}`);
  console.log(`- Total Price History Records in DB: ${totalPrices}`);
  console.log('========================================\n');
}

testScraperDatabaseFeed()
  .catch((err) => {
    console.error('❌ Scraper feed test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
