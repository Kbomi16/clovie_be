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

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMyInfo(@Req() req: Request) {
    // AuthGuard에서 req.user에 저장한 사용자 정보 가져오기
    const currentUser = req.user;
    const user = await this.usersService.findById(currentUser.id);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const { email, nickname, points, grade } = user;
    return {
      message: '사용자 정보를 불러왔습니다.',
      user: { email, nickname, points, grade },
    };
  }
}
