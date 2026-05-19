import { Controller, Get, Query } from '@nestjs/common';
import { CartoonService, CartoonSeries, CartoonEpisode } from './cartoon.service';

@Controller('cartoon')
export class CartoonController {
  constructor(private readonly cartoonService: CartoonService) {}

  @Get('series')
  getSeries(): { status: number; data: CartoonSeries[] } {
    const data = this.cartoonService.getSeriesList();
    return {
      status: 200,
      data,
    };
  }

  @Get('episodes')
  async getEpisodes(
    @Query('seriesId') seriesId: string,
    @Query('keyword') keyword?: string,
  ): Promise<{ status: number; data: CartoonEpisode[] }> {
    const data = await this.cartoonService.getEpisodes(seriesId || 'doraemon', keyword);
    return {
      status: 200,
      data,
    };
  }

  @Get('episode-embed')
  async getEpisodeEmbed(@Query('slug') slug: string) {
    const data = await this.cartoonService.getEpisodeEmbed(slug);
    return data;
  }
}
