import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';

/**
 * 🏗 Feature Module
 * Encapsulates everything related to Posts.
 * PrismaService is available here because PrismaModule is @Global().
 */
@Module({
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
