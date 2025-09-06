import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SignupUserDto } from 'src/auth/dto/signup-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SuccessResponse } from 'src/common/dto/response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // ! 회원 생성 for 회원가입
  async createUser(user: SignupUserDto) {
    const userEntity = this.usersRepository.create(user);
    try {
      return await this.usersRepository.save(userEntity);
    } catch (e) {
      const isDup =
        e?.code === 'ER_DUP_ENTRY' || e?.errno === 1062 || e?.code === '1062';
      if (isDup) {
        const msg: string = e?.sqlMessage || e?.message || '';
        if (msg.includes('email')) {
          throw new ConflictException('이미 사용 중인 이메일입니다.');
        }
        if (msg.includes('nickname')) {
          throw new ConflictException('이미 사용 중인 닉네임입니다.');
        }
        throw new ConflictException('이미 사용 중인 정보가 있습니다.');
      }
      throw new InternalServerErrorException(
        '사용자 생성 처리 중 오류가 발생했습니다.',
      );
    }
  }

  // ! 이메일 or 닉네임으로 회원 조회
  async findByEmailOrNickname(email: string, nickname: string) {
    return await this.usersRepository.findOne({
      where: [{ email }, { nickname }],
    });
  }

  // ! 로그인 시 이메일로 회원 조회 (비밀번호 포함)
  async findUserForAuth(email: string) {
    return await this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'nickname', 'password', 'grade'],
    });
  }

  // ! 회원 아이디로 회원 조회
  async findById(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return new SuccessResponse('사용자를 조회합니다.', user);
  }

  // ! 내 정보 수정
  // 닉네임, 프로필 이미지 수정가능
  async updateMe(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    Object.assign(user, updateUserDto);
    await this.usersRepository.save(user);

    return new SuccessResponse('내 정보가 성공적으로 수정되었습니다.', {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      profileUrl: user.profileUrl,
      grade: user.grade,
      points: user.points,
      createdAt: user.createdAt,
    });
  }

  // ! 회원 탈퇴 (실제 삭제 X, 상태만 INACTIVE로 변경)
}
