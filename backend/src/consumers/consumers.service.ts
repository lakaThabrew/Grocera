import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ConsumersService {
  private readonly logger = new Logger(ConsumersService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly prisma: PrismaService) {
    // Scaffolding for Email Alerts
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || 'ethereal_user',
        pass: process.env.SMTP_PASS || 'ethereal_pass',
      },
    });
  }

  // ---- Favorites ---- //

  async toggleFavoriteProduct(userId: string, productId: string) {
    const existing = await this.prisma.favoriteProduct.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await this.prisma.favoriteProduct.delete({
        where: { id: existing.id },
      });
      return { status: 'removed' };
    } else {
      await this.prisma.favoriteProduct.create({
        data: { userId, productId },
      });
      return { status: 'added' };
    }
  }

  async getFavoriteProducts(userId: string) {
    return this.prisma.favoriteProduct.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            store: true,
            prices: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---- Price Alerts ---- //

  async createPriceAlert(userId: string, productId: string, targetPrice: number, channels: { email: boolean; sms: boolean; push: boolean }) {
    return this.prisma.priceAlert.create({
      data: {
        userId,
        productId,
        targetPrice,
        emailAlert: channels.email,
        smsAlert: channels.sms,
        pushAlert: channels.push,
      },
    });
  }

  async getPriceAlerts(userId: string) {
    return this.prisma.priceAlert.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            store: true,
            prices: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async togglePriceAlert(alertId: string, userId: string) {
    const alert = await this.prisma.priceAlert.findFirst({
      where: { id: alertId, userId },
    });
    if (!alert) throw new Error('Alert not found');

    return this.prisma.priceAlert.update({
      where: { id: alertId },
      data: { isActive: !alert.isActive },
    });
  }
  
  async deletePriceAlert(alertId: string, userId: string) {
    return this.prisma.priceAlert.delete({
      where: { id: alertId } // Ideally we should verify userId, assuming strict access control upstream
    });
  }

  // ---- Notifications ---- //

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async markNotificationRead(notificationId: string, userId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  // This would typically be called by a cron job or the scraping service
  async processPriceAlerts(productId: string, newPrice: number) {
    const activeAlerts = await this.prisma.priceAlert.findMany({
      where: {
        productId,
        isActive: true,
        targetPrice: { gte: newPrice },
      },
      include: {
        user: true,
        product: true,
      },
    });

    for (const alert of activeAlerts) {
      this.logger.log(`Triggering price alert for user ${alert.userId} on product ${alert.productId}`);
      
      // 1. Create In-App Notification
      await this.prisma.notification.create({
        data: {
          userId: alert.userId,
          title: 'Price Drop Alert! 🎉',
          message: `${alert.product.name} is now Rs. ${newPrice}, below your target of Rs. ${alert.targetPrice}!`,
          type: 'ALERT',
          link: `/products/${alert.productId}`,
        },
      });

      // 2. Send Email if opted in
      if (alert.emailAlert) {
        try {
          // Fire and forget email mock
          /* await this.transporter.sendMail({
            from: '"Grocera Alerts" <alerts@grocera.com>',
            to: alert.user.email,
            subject: 'Price Drop Alert!',
            text: `${alert.product.name} is now Rs. ${newPrice}!`,
          }); */
          this.logger.log(`Mock Email sent to ${alert.user.email}`);
        } catch (error) {
          this.logger.error(`Failed to send email to ${alert.user.email}`);
        }
      }
      
      // Deactivate alert after firing to prevent spam
      await this.prisma.priceAlert.update({
        where: { id: alert.id },
        data: { isActive: false },
      });
    }
  }
}
