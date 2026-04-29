import { Controller, Get } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostDto } from '@prisma/client';

@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get()
  findAll(): Promise<PostDto[]> {
    return this.postsService.findAll();
  }
}
