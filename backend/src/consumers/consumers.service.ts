import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as nodemailer from 'nodemailer';
import { Twilio } from 'twilio';
import * as webpush from 'web-push';
@Injectable()
export class ConsumersService {
  private readonly logger = new Logger(ConsumersService.name);
  private transporter: nodemailer.Transporter;
  private twilioClient: Twilio | null = null;

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

    // Twilio Setup (Free Trial)
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    if (twilioSid && twilioToken) {
      this.twilioClient = new Twilio(twilioSid, twilioToken);
    }

    // Web Push Setup
    const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    if (vapidPublicKey && vapidPrivateKey) {
      try {
        webpush.setVapidDetails(
          'mailto:admin@grocera.com',
          vapidPublicKey,
          vapidPrivateKey,
        );
      } catch {
        this.logger.warn('VAPID initialization skipped (invalid key pair)');
      }
    }
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

  async createPriceAlert(
    userId: string,
    productId: string,
    targetPrice: number,
    channels: { email: boolean; sms: boolean; push: boolean },
  ) {
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
    const alert = await this.prisma.priceAlert.findFirst({
      where: { id: alertId, userId },
    });
    if (!alert) throw new Error('Alert not found or unauthorized');

    return this.prisma.priceAlert.delete({
      where: { id: alertId },
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
    const notification = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification)
      throw new Error('Notification not found or unauthorized');

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
      this.logger.log(
        `Triggering price alert for user ${alert.userId} on product ${alert.productId}`,
      );

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
      if (alert.emailAlert && alert.user.email) {
        try {
          await this.transporter.sendMail({
            from: '"Grocera Alerts" <alerts@grocera.com>',
            to: alert.user.email,
            subject: 'Price Drop Alert!',
            text: `${alert.product.name} is now Rs. ${newPrice}!`,
          });
          this.logger.log(`Email sent to ${alert.user.email}`);
        } catch (error) {
          this.logger.error(
            `Failed to send email to ${alert.user.email}`,
            error,
          );
        }
      }

      // 3. Send SMS if opted in
      if (alert.smsAlert && this.twilioClient) {
        try {
          const profile = await this.prisma.profile.findUnique({
            where: { userId: alert.user.id },
          });
          const phone = profile?.phone || process.env.TWILIO_TEST_NUMBER;

          if (phone) {
            await this.twilioClient.messages.create({
              body: `Grocera Alert: ${alert.product.name} is now Rs. ${newPrice}!`,
              from: process.env.TWILIO_PHONE_NUMBER || '+1234567890',
              to: phone,
            });
            this.logger.log(`SMS sent to ${phone}`);
          }
        } catch (error) {
          this.logger.error(`Failed to send SMS`, error);
        }
      }

      // 4. Send Push Notification if opted in
      if (alert.pushAlert) {
        try {
          // Normally fetch PushSubscription from DB. Simulation here.
          const pushSubscription = null;
          if (pushSubscription) {
            await webpush.sendNotification(
              pushSubscription,
              JSON.stringify({
                title: 'Price Drop Alert! 🎉',
                body: `${alert.product.name} is now Rs. ${newPrice}!`,
              }),
            );
            this.logger.log(`Push notification sent to user ${alert.user.id}`);
          } else {
            this.logger.log(
              `No push subscription found for user ${alert.user.id}, skipping push`,
            );
          }
        } catch (error) {
          this.logger.error(`Failed to send push notification`, error);
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
