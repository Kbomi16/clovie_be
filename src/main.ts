import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 필드 제거
      forbidNonWhitelisted: true, // 허용되지 않은 필드가 오면 에러
      transform: true, // 타입 변환
    }),
  );

  // CORS 설정
  app.enableCors({
    origin: ['http://localhost:3000', 'https://clovie-fe.vercel.app/'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
