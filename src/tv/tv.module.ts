import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TvChannel } from './domain/entities/tv-channel.entity';
import { TvFavorite } from './domain/entities/tv-favorite.entity';
import { TvHistory } from './domain/entities/tv-history.entity';
import { TvService } from './application/tv.service';
import { TvController } from './interfaces/tv.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TvChannel, TvFavorite, TvHistory]),
  ],
  controllers: [TvController],
  providers: [TvService],
  exports: [TvService],
})
export class TvModule {}
