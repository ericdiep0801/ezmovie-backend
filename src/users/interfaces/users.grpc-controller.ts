import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from '../application/users.service';
import { User } from '../domain/entities/user.entity';

@Controller()
export class UsersGrpcController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UsersService', 'FindOne')
  async findOne(data: { id: number }): Promise<User | null> {
    return this.usersService.findOneById(data.id);
  }

  @GrpcMethod('UsersService', 'FindAll')
  async findAll(): Promise<{ users: User[] }> {
    const users = await this.usersService.findAll();
    return { users };
  }
}
