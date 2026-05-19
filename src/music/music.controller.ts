import { Controller, Get, Query } from '@nestjs/common';
import { MusicService, TrackDto } from './music.service';

@Controller('music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Get('trending')
  async getTrending(): Promise<{ status: number; data: TrackDto[] }> {
    const data = await this.musicService.getTrendingTracks();
    return {
      status: 200,
      data,
    };
  }

  @Get('search')
  async search(
    @Query('keyword') keyword: string,
  ): Promise<{ status: number; data: TrackDto[] }> {
    const data = await this.musicService.searchTracks(keyword || '');
    return {
      status: 200,
      data,
    };
  }
}
