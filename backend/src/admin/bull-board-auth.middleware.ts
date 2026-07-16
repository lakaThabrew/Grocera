import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import basicAuth from 'express-basic-auth';

@Injectable()
export class BullBoardAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin';
    const password = process.env.BULL_BOARD_PASSWORD || 'password123';

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
