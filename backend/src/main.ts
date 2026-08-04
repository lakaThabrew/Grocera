import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import compression from 'compression';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

async function bootstrap() {
  const logDirectory = resolve(process.env.LOG_DIRECTORY ?? 'logs');
  mkdirSync(logDirectory, { recursive: true });

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            nestWinstonModuleUtilities.format.nestLike('Grocera', {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
        new winston.transports.DailyRotateFile({
          filename: resolve(logDirectory, 'error-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
        new winston.transports.DailyRotateFile({
          filename: resolve(logDirectory, 'app-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  });

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  const configuredFrontendOrigins = (process.env.FRONTEND_URL ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const localDevelopmentOrigins = [
    'http://localhost:3000',
    'http://localhost:3002',
  ];
  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? configuredFrontendOrigins
      : [
          ...new Set([
            ...configuredFrontendOrigins,
            ...localDevelopmentOrigins,
          ]),
        ];

  // CORS
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Compression
  app.use(compression());

  // Versioning (Native)
  app.enableVersioning();

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Grocera API')
    .setDescription('The Grocera Retail Intelligence API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start Server on Port 3001
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
