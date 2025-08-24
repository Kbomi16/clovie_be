import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TokenMiddleware implements NestMiddleware {
  /**
   * @param req - 클라이언트의 요청 정보를 담고 있는 객체
   * @param res - 클라이언트에게 응답을 보낼 때 사용하는 객체
   * @param next - 다음 미들웨어나 라우트 핸들러를 호출하는 함수
   */
  use(req: Request, res: Response, next: NextFunction) {
    // 클라이언트가 보낸 요청의 헤더에서 'authorization' 키를 찾는다.
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      // 특정 라우트에서는 토큰이 필요 없을 수도 있기 때문에 에러가는 가드에서 처리함
      return next();
    }

    // 'authorization' 헤더는 보통 'Bearer <토큰값>' 형식임 -> 토큰 값만 추출
    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('유효하지 않은 토큰 형식입니다.');
    }

    req['token'] = token;
    next();
  }
}
