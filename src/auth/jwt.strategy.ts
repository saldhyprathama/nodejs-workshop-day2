import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * 🔑 JWT Strategy
 * Passport extracts the Bearer token → verifies signature → calls validate()
 * The return value of validate() is attached to req.user
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'workshop_secret',
    });
  }

  validate(payload: { sub: number; email: string; role: string }) {
    // Return value becomes req.user on every protected route
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
