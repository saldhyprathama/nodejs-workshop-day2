import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

type UserDelegate = PrismaClient['user'];
type PostDelegate = PrismaClient['post'];

/**
 * 🔑 NestJS Lifecycle Demo
 * OnModuleInit    → called when this module is fully initialised
 * OnModuleDestroy → called right before the app shuts down
 *
 * Prisma v7 uses driver adapters. PrismaBetterSqlite3 connects
 * directly to the SQLite file — no separate query engine binary needed.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly client: PrismaClient;

  constructor() {
    // DATABASE_URL from .env (e.g. "file:./dev.db") resolves relative to cwd
    const dbUrl = process.env.DATABASE_URL ?? 'file:./dev.db';
    const adapter = new PrismaBetterSqlite3({ url: dbUrl });
    this.client = new PrismaClient({ adapter } as Prisma.PrismaClientOptions);
  }

  get user(): UserDelegate {
    return this.client.user;
  }

  get post(): PostDelegate {
    return this.client.post;
  }

  $transaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.client.$transaction(fn);
  }

  async onModuleInit() {
    this.logger.log('⚡ Connecting to SQLite via Prisma…');
    await this.client.$connect();
    this.logger.log('✅ Prisma connected');
  }

  async onModuleDestroy() {
    this.logger.log('🔌 Disconnecting Prisma…');
    await this.client.$disconnect();
  }
}
