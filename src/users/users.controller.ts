import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async signup(@Body() dto: CreateUserDto) {
    const user = await this.usersService.createUser(dto);
    return { message: '회원가입이 완료되었습니다.', user };
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    const user = await this.usersService.login(dto);
    return { message: '로그인에 성공했습니다.', user };
  }
}
