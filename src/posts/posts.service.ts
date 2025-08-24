import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  // ! 게시물 생성
  async create(createPostDto: CreatePostDto, user: User) {
    const post = this.postsRepository.create({
      ...createPostDto,
      author: user,
    });
    return {
      message: '게시글이 성공적으로 생성되었습니다.',
      post: await this.postsRepository.save(post),
    };
  }

  // ! 전체 게시물 조회
  async findAll() {
    return {
      message: '전체 게시글을 조회합니다.',
      posts: await this.postsRepository.find({
        select: {
          id: true,
          title: true,
          tags: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          author: {
            id: true,
            nickname: true,
            email: true,
          },
        },
        relations: {
          author: true,
        },
      }),
    };
  }

  // ! 특정 게시물 조회
  async findOne(id: number) {
    return {
      message: `id가 ${id}인 게시글을 조회합니다.`,
      post: await this.postsRepository.findOne({
        where: { id },
        select: {
          id: true,
          title: true,
          tags: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          author: {
            id: true,
            nickname: true,
            email: true,
          },
        },
        relations: {
          author: true,
        },
      }),
    };
  }
}
