import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import basicAuth from 'express-basic-auth';

@Injectable()
export class BullBoardAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let adminEmail;
    let password;
    try {
      adminEmail = process.env.ADMIN_EMAIL;
      password = process.env.BULL_BOARD_PASSWORD;
      if (!adminEmail || !password) {
        console.error('Missing ADMIN_EMAIL or BULL_BOARD_PASSWORD environment variables');
      }
    } catch (error) {
      console.error('Error loading environment variables:', error);
    }

    const authHandler = basicAuth({
      users: {
        [adminEmail]: password,
        'admin': password, // Fallback allowing 'admin' as username
      },
      challenge: true,
      realm: 'Grocera Admin Queues',
    });

    authHandler(req, res, next);
  }
}
