import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './domain/entities/favorite.entity';
import { WatchHistory } from './domain/entities/history.entity';
import { Comment } from './domain/entities/comment.entity';
import { User } from '../users/domain/entities/user.entity';
import { MoviesService } from './application/movies.service';
import { MoviesController } from './interfaces/movies.controller';
import { MoviesResolver } from './interfaces/graphql/movies.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Favorite, WatchHistory, Comment, User]),
  ],
  controllers: [MoviesController],
  providers: [MoviesService, MoviesResolver],
  exports: [MoviesService],
})
export class MoviesModule {}
