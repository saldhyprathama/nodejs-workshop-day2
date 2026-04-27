import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './auth.dto';

/**
 * Authentication Flow
 *
 * Register → hash password with bcrypt → save User in SQLite
 * Login    → verify password → sign JWT → return token
 *
 * JWT Lifecycle:
 *   Client sends  POST /auth/login  → receives { access_token }
 *   Client attaches token in header: Authorization: Bearer <token>
 *   JwtAuthGuard validates the token on protected routes
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, password: hashed },
    });

    this.logger.log(`✅ New user registered: ${user.email}`);
    const { password: _, ...safe } = user;
    return safe;
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    // JWT payload — keep it minimal (never store sensitive data in JWT)
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    this.logger.log(`🔐 User logged in: ${user.email}`);
    return { access_token: token };
  }
}
