import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './application/users.service';
import { User } from './domain/entities/user.entity';
import { UsersResolver } from './interfaces/users.resolver';
import { UsersGrpcController } from './interfaces/users.grpc-controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersGrpcController],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
