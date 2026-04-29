import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { PdfModule } from './pdf/pdf.module';
import { LoggerMiddleware } from './common/logger.middleware';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

/**
 * 🏗 Root Module — AppModule
 *
 * NestJS Lifecycle (order of execution on startup):
 *   1. Module instantiation (imports resolved, providers created)
 *   2. onModuleInit()  → PrismaService connects to DB here
 *   3. onApplicationBootstrap() → app is fully ready
 *
 * On shutdown:
 *   1. onModuleDestroy() → PrismaService disconnects
 *   2. beforeApplicationShutdown()
 */
@Module({
  imports: [
    PrismaModule, // @Global — PrismaService available everywhere
    AuthModule, // JWT auth, register/login endpoints
    PostsModule, // CRUD posts, protected routes demo
    PdfModule, // Worker threads PDF generation
  ],
  controllers: [AppController],
  providers: [
    AppService,
    /**
     * APP_FILTER — global exception filter (wired via DI, not useGlobalFilters).
     * This allows the filter to have its own injected dependencies.
     * PrismaExceptionFilter maps Prisma error codes → HTTP status codes.
     */
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    /**
     * APP_INTERCEPTOR — global response wrapper.
     * Every successful response is shaped as { statusCode, data, timestamp }.
     */
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  /**
   * Apply LoggerMiddleware to ALL routes.
   * Middleware is applied here at the module level — not on individual routes.
   */
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
