import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PublicApiService {
  private readonly logger = new Logger(PublicApiService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getProducts(skip: number = 0, take: number = 20, search?: string, categoryId?: string, storeId?: string) {
    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (storeId) {
      where.storeId = storeId;
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        include: {
          category: { select: { id: true, name: true } },
          store: { select: { id: true, name: true } },
          prices: { orderBy: { createdAt: 'desc' }, take: 1, select: { price: true, currency: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { data: items, meta: { total, skip, take } };
  }

  async getStores() {
    return this.prisma.store.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });
  }

  async getCategories() {
    return this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });
  }

  async getProductHistory(productId: string) {
    return this.prisma.priceHistory.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        price: true,
        currency: true,
        createdAt: true,
      },
    });
  }
}
