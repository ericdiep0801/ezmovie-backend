import { Module } from '@nestjs/common';
import { TvShowsController } from './tvshows.controller';
import { TvShowsService } from './tvshows.service';

@Module({
  controllers: [TvShowsController],
  providers: [TvShowsService],
  exports: [TvShowsService],
})
export class TvShowsModule {}
