import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import basicAuth from 'express-basic-auth';

@Injectable()
export class BullBoardAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const adminEmail = process.env.ADMIN_EMAIL;
    const password =
      process.env.BULL_BOARD_PASSWORD ?? process.env.ADMIN_PASSWORD;

    if (!adminEmail || !password) {
      res.status(503).json({
        message:
          'Queue dashboard authentication is not configured. Set ADMIN_EMAIL and BULL_BOARD_PASSWORD or ADMIN_PASSWORD.',
      });
      return;
    }

    const authHandler = basicAuth({
      users: {
        [adminEmail]: password,
      },
      challenge: true,
      realm: 'Grocera Admin Queues',
    });

    authHandler(req, res, next);
  }
}
