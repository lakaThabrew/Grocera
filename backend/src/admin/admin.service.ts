import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [totalUsers, totalProducts, totalStores, totalActiveSubscriptions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.store.count(),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      totalUsers,
      totalProducts,
      totalStores,
      totalActiveSubscriptions,
    };
  }

  async getUsers(skip: number = 0, take: number = 20) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          email: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
          profile: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { data: users, meta: { total, skip, take } };
  }

  async createUser(data: any) {
    // Basic implementation for manual user creation
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password || 'default_password', // Should be hashed in prod
        role: data.role || 'CONSUMER',
        isEmailVerified: true,
        profile: {
          create: {
            firstName: data.firstName || '',
            lastName: data.lastName || '',
          }
        }
      },
      select: { id: true, email: true, role: true }
    });
  }

  async updateUserRole(id: string, role: 'ADMIN' | 'CONSUMER' | 'BUSINESS') {
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, role: true },
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async getHealth() {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    // Read last 50 lines of today's log file if it exists
    const date = new Date().toISOString().split('T')[0];
    const logFilePath = path.join(process.cwd(), 'logs', `app-${date}.log`);
    let recentLogs: any[] = [];

    try {
      if (fs.existsSync(logFilePath)) {
        const fileContent = fs.readFileSync(logFilePath, 'utf-8');
        const lines = fileContent.split('\n').filter(line => line.trim() !== '');
        recentLogs = lines.slice(-50).map(line => JSON.parse(line));
      }
    } catch (e) {
      console.error('Error reading log file', e);
    }

    return {
      uptime,
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
      },
      os: {
        freemem: os.freemem(),
        totalmem: os.totalmem(),
      },
      recentLogs,
    };
  }
}
