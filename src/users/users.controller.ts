import { Controller, Get, Put, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { SuccessResponse } from 'src/common/dto/response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User as AuthUser } from '../common/decorators/user.decorator';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@AuthUser() user: { id: string }) {
    return this.usersService.findById(user.id);
  }

  @Put('me')
  async updateMe(
    @AuthUser() user: { id: string },
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateMe(user.id, updateUserDto);
  }
}
