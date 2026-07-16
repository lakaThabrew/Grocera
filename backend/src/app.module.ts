import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma.module';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { ScrapingModule } from './scraping/scraping.module';
import { AiModule } from './ai/ai.module';
import { BasketsModule } from './baskets/baskets.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ConsumersModule } from './consumers/consumers.module';
import { BusinessModule } from './business/business.module';
import { PublicApiModule } from './public-api/public-api.module';
import { AdminModule } from './admin/admin.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardAuthMiddleware } from './admin/bull-board-auth.middleware';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // 100 requests per minute
    }]),
    CacheModule.register({
      isGlobal: true, // Make cache available globally
      ttl: 300000, // 5 minutes default TTL
    }),
    UsersModule,
    AuthModule,
    PrismaModule,
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    ScrapingModule,
    AiModule,
    BasketsModule,
    AnalyticsModule,
    ConsumersModule,
    BusinessModule,
    PublicApiModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BullBoardAuthMiddleware)
      .forRoutes({ path: '/admin/queues*', method: RequestMethod.ALL });
  }
}
