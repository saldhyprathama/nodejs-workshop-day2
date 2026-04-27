import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './posts.dto';

/**
 * 🏗 Dependency Injection (DI)
 *
 * PostsService declares PrismaService in its constructor.
 * NestJS DI container resolves and injects it automatically —
 * no `new PrismaService()` needed anywhere.
 *
 * This is the Single Responsibility Principle in action:
 *   Controller  → handles HTTP (req/res)
 *   Service     → handles business logic
 *   PrismaService → handles database
 */
@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  // 👇 DI: NestJS injects PrismaService here automatically
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.post.findMany({
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    if (!post) throw new NotFoundException(`Post #${id} not found`);
    return post;
  }

  async create(dto: CreatePostDto, authorId: number) {
    const post = await this.prisma.post.create({
      data: { title: dto.title, body: dto.body, authorId },
      include: { author: { select: { id: true, name: true } } },
    });
    this.logger.log(`📝 Post created: "${post.title}" by user #${authorId}`);
    return post;
  }

  async remove(id: number, requesterId: number) {
    const post = await this.findOne(id);
    if (post.authorId !== requesterId)
      throw new NotFoundException(`Post #${id} not found or not yours`);
    await this.prisma.post.delete({ where: { id } });
    return { message: `Post #${id} deleted` };
  }
}
