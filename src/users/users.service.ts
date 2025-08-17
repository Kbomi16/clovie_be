import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Grade } from './constants/grade.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // ! 회원가입
  async createUser(dto: CreateUserDto) {
    const { email, nickname, password } = dto;

    // 사전 중복 체크
    const existed = await this.usersRepository.findOne({
      where: [{ email }, { nickname }],
    });
    if (existed) {
      const field = existed.email === email ? '이메일' : '닉네임';
      throw new ConflictException(`${field}이(가) 이미 사용 중입니다.`);
    }

    // 비밀번호 해싱
    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(password, salt);

    const user = this.usersRepository.create({
      email,
      nickname,
      password: hashed,
      grade: dto.grade || Grade.Seedling, // 없으면 기본값
    });

    try {
      const saved = await this.usersRepository.save(user);
      const { password, ...safe } = saved;
      return safe;
    } catch (e) {
      // MySQL 중복 키 방어
      const isDup =
        e?.code === 'ER_DUP_ENTRY' || e?.errno === 1062 || e?.code === '1062';
      if (isDup) {
        const msg: string = e?.sqlMessage || e?.message || '';
        console.log(msg);
        if (msg.includes('email')) {
          throw new ConflictException('이미 사용 중인 이메일입니다.');
        }
        if (msg.includes('nickname')) {
          throw new ConflictException('이미 사용 중인 닉네임입니다.');
        }
        throw new ConflictException('이미 사용 중인 정보가 있습니다.');
      }
      throw new InternalServerErrorException(
        '회원가입 처리 중 오류가 발생했습니다.',
      );
    }
  }
}
