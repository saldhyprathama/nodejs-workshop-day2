import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 🔑 Guard vs Middleware
 *
 * Middleware runs before routing — great for logging, rate-limiting.
 * Guards run after routing — they know the route context (handler, class).
 * Guards return true/false to allow/block execution.
 *
 * JwtAuthGuard wraps Passport's JWT strategy as a NestJS Guard.
 * Usage: @UseGuards(JwtAuthGuard) on any controller or route handler.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
