import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { SuccessResponse } from 'src/common/dto/response.dto';

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

    const savedPost = await this.postsRepository.save(post);
    return new SuccessResponse(
      '게시글이 성공적으로 생성되었습니다.',
      savedPost,
    );
  }

  // ! 전체 게시물 조회
  async findAll(offset = 0, limit = 9) {
    // findAndCount로 데이터 + 전체 개수 동시에 가져오기
    const [posts, totalCount] = await this.postsRepository.findAndCount({
      skip: 0, // offset
      take: 9, // limit
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
      relations: { author: true },
    });

    // SuccessResponse에 페이지네이션 정보 포함
    return new SuccessResponse(
      '전체 게시글을 조회합니다.',
      posts,
      offset,
      limit,
      totalCount,
    );
  }

  // ! 특정 게시물 조회
  async findOne(id: number) {
    const post = await this.postsRepository.findOne({
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
    });

    return new SuccessResponse(`id가 ${id}인 게시글을 조회합니다.`, post);
  }
}
