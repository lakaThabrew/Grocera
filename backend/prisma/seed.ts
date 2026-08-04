import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (!existingAdmin) {
      const adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          isEmailVerified: true,
          profile: {
            create: {
              firstName: 'Super',
              lastName: 'Admin',
            },
          },
        },
      });
      console.log(`Created default admin user: ${adminUser.email}`);
    }
  } else {
    console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not found. Skipping admin creation.');
  }

  // Development-only account intentionally shown on the local login screen.
  const demoEmail = 'demo.consumer@grocera.test';
  const demoPassword = 'Demo12345!';
  if (process.env.NODE_ENV !== 'production') {
    const hashedDemoPassword = await bcrypt.hash(demoPassword, 10);

    await prisma.user.upsert({
      where: { email: demoEmail },
      update: {
        password: hashedDemoPassword,
        role: 'CONSUMER',
        isEmailVerified: true,
        profile: {
          upsert: {
            update: { firstName: 'Demo', lastName: 'Consumer' },
            create: { firstName: 'Demo', lastName: 'Consumer' },
          },
        },
      },
      create: {
        email: demoEmail,
        password: hashedDemoPassword,
        role: 'CONSUMER',
        isEmailVerified: true,
        profile: { create: { firstName: 'Demo', lastName: 'Consumer' } },
      },
    });
    console.log(`Ensured development demo user: ${demoEmail}`);
  }

  const testPassword = adminPassword ?? demoPassword;
  const hashedPassword = await bcrypt.hash(testPassword, 10);

  // Create Business test user
  const businessEmail = 'business@grocera.com';
  const existingBusiness = await prisma.user.findUnique({ where: { email: businessEmail } });
  if (!existingBusiness) {
    const busUser = await prisma.user.create({
      data: {
        email: businessEmail,
        password: hashedPassword,
        role: 'BUSINESS',
        isEmailVerified: true,
        profile: { create: { firstName: 'Retail', lastName: 'Partner' } },
      },
    });
    console.log(`Created business user: ${busUser.email}`);
  }

  // Create Consumer test user
  const consumerEmail = 'consumer@grocera.com';
  const existingConsumer = await prisma.user.findUnique({ where: { email: consumerEmail } });
  if (!existingConsumer) {
    const conUser = await prisma.user.create({
      data: {
        email: consumerEmail,
        password: hashedPassword,
        role: 'CONSUMER',
        isEmailVerified: true,
        profile: { create: { firstName: 'Kasun', lastName: 'Perera' } },
      },
    });
    console.log(`Created consumer user: ${conUser.email}`);
  }

  // Seed Stores
  const storeNames = ['Keells', 'Cargills', 'Arpico', 'Glomark'];
  const stores: Record<string, any> = {};
  for (const name of storeNames) {
    let s = await prisma.store.findUnique({ where: { name } });
    if (!s) {
      s = await prisma.store.create({ data: { name, url: `https://www.${name.toLowerCase()}.com` } });
    }
    stores[name] = s;
  }

  // Seed Categories
  const categoryNames = ['Grains & Staples', 'Dairy & Eggs', 'Beverages'];
  const categories: Record<string, any> = {};
  for (const name of categoryNames) {
    let c = await prisma.category.findUnique({ where: { name } });
    if (!c) {
      c = await prisma.category.create({ data: { name } });
    }
    categories[name] = c;
  }

  // Seed Sample Products
  const sampleProducts = [
    { name: 'Samba Rice 5kg', store: 'Keells', cat: 'Grains & Staples', brand: 'Nipuna', price: 1050 },
    { name: 'Samba Rice 5kg', store: 'Cargills', cat: 'Grains & Staples', brand: 'Nipuna', price: 1100 },
    { name: 'Anchor Milk Powder 400g', store: 'Cargills', cat: 'Dairy & Eggs', brand: 'Anchor', price: 950 },
    { name: 'Anchor Milk Powder 400g', store: 'Keells', cat: 'Dairy & Eggs', brand: 'Anchor', price: 980 },
    { name: 'Ceylon Black Tea 100s', store: 'Arpico', cat: 'Beverages', brand: 'Dilmah', price: 680 },
  ];

  for (const p of sampleProducts) {
    const existingP = await prisma.product.findFirst({
      where: { name: p.name, storeId: stores[p.store].id },
    });

    if (!existingP) {
      const prod = await prisma.product.create({
        data: {
          name: p.name,
          brand: p.brand,
          storeId: stores[p.store].id,
          categoryId: categories[p.cat].id,
          prices: {
            create: {
              price: p.price,
              currency: 'Rs.',
            },
          },
        },
      });
      console.log(`Created product: ${prod.name} (${p.store}) - Rs.${p.price}`);
    }
  }

  console.log('Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
