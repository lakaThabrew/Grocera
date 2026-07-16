import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not found in environment variables. Skipping admin creation.');
    console.log('Seeding finished.');
    return;
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
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
    console.log(`Default password: ${adminPassword}`);
  } else {
    console.log('Admin user already exists. Skipping...');
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
