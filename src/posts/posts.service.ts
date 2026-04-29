import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './posts.dto';
import { Post } from '@prisma/client';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Post[]> {
    return this.prisma.post.findMany({
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
