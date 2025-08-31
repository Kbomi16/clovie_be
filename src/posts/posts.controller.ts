import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from 'src/common/decorators/user.decorator';
import { User as UserEntity } from 'src/users/entities/user.entity';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Public()
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  // @User() 데코레이터 -> 인증 토큰에서 추출한, 현재 로그인된 사용자의 전체 정보 객체
  @Post()
  create(@Body() createPostDto: CreatePostDto, @User() user: UserEntity) {
    return this.postsService.create(createPostDto, user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePostDto: CreatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.postsService.delete(+id);
  }
}
