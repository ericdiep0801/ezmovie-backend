import * as crypto from 'crypto';
if (!global.crypto) {
  (global as any).crypto = crypto;
}

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import helmet from 'helmet';
import compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Trust proxy - Required to get real user IP from X-Forwarded-For header
  // when deployed behind Nginx, Cloudflare, Render, Vercel, etc.
  app.set('trust proxy', true);

  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === 'production' ? undefined : false,
    }),
  );
  app.use(compression());

  // Configure gRPC
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'users',
      protoPath: join(process.cwd(), 'src/proto/users.proto'),
    },
  });

  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>('FRONTEND_URL')!;

  app.enableCors({
    origin: [frontendUrl, 'https://518c-115-78-6-138.ngrok-free.app'],
    credentials: true,
  }); // Cho phép frontend gọi API

  // Cấu hình để serve file tĩnh từ thư mục uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Bật tính năng kiểm tra DTO tự động
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các trường không có trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu gửi lên trường lạ
      transform: true, // Tự động convert kiểu dữ liệu
      stopAtFirstError: true, // Chỉ trả về lỗi đầu tiên gặp phải
    }),
  );

  await app.startAllMicroservices();
  const port = configService.get<number>('PORT')!;

  await app.listen(port);
}
bootstrap();
