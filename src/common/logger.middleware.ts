import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * 🔑 Middleware vs Guards
 *
 * Middleware:
 *   • Runs BEFORE route matching
 *   • Has no knowledge of which handler will execute
 *   • Great for: logging, rate-limiting, CORS, parsing
 *
 * Guards:
 *   • Run AFTER routing, BEFORE the handler
 *   • Have access to ExecutionContext (knows the controller + method)
 *   • Great for: authentication, authorisation, role checks
 *
 * This middleware logs every incoming request — no auth knowledge needed.
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const ms = Date.now() - start;
      const { statusCode } = res;
      this.logger.log(`${method} ${originalUrl} ${statusCode} — ${ms}ms`);
    });

    next();
  }
}
