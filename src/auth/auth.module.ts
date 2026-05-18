import { Module } from '@nestjs/common';
import { AuthService } from './application/auth.service';
import { AuthController } from './interfaces/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/domain/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { GoogleStrategy } from './infrastructure/strategies/google.strategy';
import { AuthResolver } from './interfaces/graphql/auth.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET')!,

        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') as any,
        },

      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, GoogleStrategy, AuthResolver],
  controllers: [AuthController],
})
export class AuthModule {}
