import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './posts.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * 🔑 Guard in action
 * @UseGuards(JwtAuthGuard) protects individual routes.
 * The guard runs AFTER route matching but BEFORE the handler.
 * If the JWT is invalid/missing → 401 Unauthorized automatically.
 */
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  /** GET /posts — public, no token required */
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  /** GET /posts/:id — public */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  /** POST /posts — protected: must send Authorization: Bearer <token> */
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreatePostDto, @Req() req: any) {
    return this.postsService.create(dto, req.user.id);
  }

  /** DELETE /posts/:id — protected: only author can delete */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.postsService.remove(id, req.user.id);
  }
}
