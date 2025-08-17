import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule], // .env 환경변수 사용
      inject: [ConfigService], // ConfigService 주입
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'), // JWT 서명용 키
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') || '1d' }, // 토큰 만료 시간
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
