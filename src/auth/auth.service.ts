import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { Grade } from '../users/constants/grade.enum';
import { SignupUserDto } from './dto/signup-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // ! 회원가입
  async signup(dto: SignupUserDto) {
    const { email, nickname, password } = dto;

    // 사전 중복 체크
    const existed = await this.usersService.findByEmailOrNickname(
      email,
      nickname,
    );
    if (existed) {
      const field = existed.email === email ? '이메일' : '닉네임';
      throw new ConflictException(`${field}이(가) 이미 사용 중입니다.`);
    }

    // 비밀번호 해싱
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.usersService.createUser({
      email,
      nickname,
      password: hashedPassword,
      grade: dto.grade || Grade.Seedling,
    });

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  // ! 로그인
  async login(dto: LoginUserDto) {
    const { email, password } = dto;

    const user = await this.usersService.findUserForAuth(email);

    if (!user) {
      throw new UnauthorizedException('존재하지 않는 이메일입니다.');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    const payload = {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      grade: user.grade,
    };
    const accessToken = this.jwtService.sign(payload);

    const { password: _, ...safeUser } = user;

    return { user: safeUser, accessToken };
  }
}
