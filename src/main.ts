import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * 🏗 NestJS Bootstrap
 * ValidationPipe globally enforces all class-validator decorators (DTOs).
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Global validation pipe — validates all incoming request bodies via DTOs
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  app.enableCors();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 Workshop app running on http://localhost:${port}`);
  logger.log(`📋 Routes:`);
  logger.log(`   POST   /auth/register`);
  logger.log(`   POST   /auth/login`);
  logger.log(`   GET    /posts           (public)`);
  logger.log(`   GET    /posts/:id       (public)`);
  logger.log(`   POST   /posts           (JWT required)`);
  logger.log(`   DELETE /posts/:id       (JWT required)`);
  logger.log(`   GET    /pdf/post/:id    (JWT required — worker thread)`);
}
void bootstrap();
