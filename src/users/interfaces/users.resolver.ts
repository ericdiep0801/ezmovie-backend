import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UsersService } from '../application/users.service';
import { User } from '../domain/entities/user.entity';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user', nullable: true })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<User | null> {
    return this.usersService.findOneById(id);
  }
}
