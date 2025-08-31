import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { SignupUserDto } from 'src/auth/dto/signup-user.dto';

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
    return this.usersRepository.findOne({
      where: [{ email }, { nickname }],
    });
  }

  // ! 로그인 시 이메일로 회원 조회 (비밀번호 포함)
  async findUserForAuth(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'nickname', 'password', 'grade'],
    });
  }

  // ! 회원 아이디로 회원 조회
  async findById(id: string) {
    return this.usersRepository.findOne({
      where: { id },
    });
  }
}
