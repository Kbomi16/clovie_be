import {
  Controller,
  Get,
  UseGuards,
  NotFoundException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Request } from 'express';
import { SuccessResponse } from 'src/common/dto/response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() req: Request) {
    // req.user는 JwtAuthGuard에서 넣어준 사용자 객체
    const user = req.user;
    console.log(req.headers);
    console.log(req.user); // JWT Guard 사용 시 user 객체

    return new SuccessResponse('내 정보를 조회합니다.', {
      id: user['id'],
      email: user['email'],
      nickname: user['nickname'],
      grade: user['grade'],
      points: user['points'],
      createdAt: user['createdAt'],
    });
  }
}
