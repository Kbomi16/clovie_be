import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    // Reflector: 커스텀 데코레이터(@Public) 같은 메타데이터를 읽을 때 사용
    private reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // @Public() 데코레이터가 붙은 API는 인증 없이 접근 가능하게
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>(); // 현재 요청 객체(Express Request) 가져옴
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException(
        '인증이 필요한 서비스입니다. Authorization 헤더에 토큰을 포함해주세요.',
      );
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException(
        '올바른 Authorization 헤더 형식이 아닙니다.',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request['user'] = payload; // req.user에 payload 저장
    } catch (e) {
      throw new UnauthorizedException('토큰이 유효하지 않습니다.');
    }

    return true;
  }
}
