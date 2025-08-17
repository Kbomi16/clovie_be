import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { Grade } from './constants/grade.enum';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
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

  // ! 로그인
  async login(dto: LoginUserDto) {
    try {
      const { email, password } = dto;

      const user = await this.usersRepository.findOne({
        where: { email },
        select: ['id', 'email', 'nickname', 'password', 'grade'],
      });

      if (!user) {
        throw new UnauthorizedException('존재하지 않는 이메일입니다.');
      }

      const inValid = await bcrypt.compare(password, user.password);
      if (!inValid) {
        throw new ConflictException('비밀번호가 일치하지 않습니다.');
      }

      const payload = {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        grade: user.grade,
      };
      const accessToken = this.jwtService.sign(payload);

      const { password: pw, ...safeUser } = user;

      return { user: safeUser, accessToken };
    } catch (error) {
      console.error('로그인 실패:', error);
      throw new Error(
        error instanceof Error
          ? error.message
          : '로그인 중 오류가 발생했습니다.',
      );
    }
  }
}
