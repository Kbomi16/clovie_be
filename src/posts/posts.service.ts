import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';
import { User } from 'src/users/entities/user.entity';
import { SuccessResponse } from 'src/common/dto/response.dto';
import { UpdatePostDto } from './dto/update-post.dto';

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
  // TODO: page 방식으로 바꾸기
  async findAll(offset = 0, limit = 9) {
    // findAndCount로 데이터 + 전체 개수 동시에 가져오기
    const [posts, totalCount] = await this.postsRepository.findAndCount({
      skip: offset, // offset
      take: limit, // limit
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

  // ! 특정 게시물 수정
  async update(dto: UpdatePostDto) {
    // 1. 게시글 조회
    const post = await this.postsRepository.findOne({ where: { id: dto.id } });
    if (!post)
      throw new HttpException(
        '게시글을 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );

    // 2. 수정
    await this.postsRepository.save(dto);

    // 3. 조회할 때처럼 select + relations 포함
    const updatedPost = await this.postsRepository.findOne({
      where: { id: dto.id },
      select: {
        author: {
          id: true,
          nickname: true,
          email: true,
        },
      },
      relations: { author: true },
    });

    return new SuccessResponse(
      '게시글이 성공적으로 수정되었습니다.',
      updatedPost,
    );
  }

  // ! 특정 게시물 삭제
  async delete(id: number) {
    // 1. 게시글 조회
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post)
      throw new HttpException(
        '게시글을 찾을 수 없습니다.',
        HttpStatus.NOT_FOUND,
      );

    // 2. 삭제
    await this.postsRepository.delete(id);
    return new SuccessResponse('게시글이 성공적으로 삭제되었습니다.', null);
  }
}
