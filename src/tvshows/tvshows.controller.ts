import { Controller, Get } from '@nestjs/common';
import { TvShowsService, TvShowDto } from './tvshows.service';

@Controller('tvshows')
export class TvShowsController {
  constructor(private readonly tvShowsService: TvShowsService) {}

  @Get('top')
  async getTopShows(): Promise<{ status: number; data: TvShowDto[] }> {
    const data = await this.tvShowsService.getTopShows();
    return {
      status: 200,
      data,
    };
  }
}
