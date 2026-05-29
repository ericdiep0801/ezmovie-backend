import { Controller, Get, Query, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CartoonService, CartoonSeries, CartoonEpisode } from './cartoon.service';
import { JwtAuthGuard } from '../auth/infrastructure/guards/jwt-auth.guard';

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

  @UseGuards(JwtAuthGuard)
  @Post('history')
  async saveHistory(
    @Req() req: any,
    @Body() body: { seriesId: string; episodeId: string; progressPercent: number },
  ) {
    const userId = req.user.userId;
    const { seriesId, episodeId, progressPercent } = body;
    const history = await this.cartoonService.saveHistory(userId, seriesId, episodeId, progressPercent);
    return {
      status: 201,
      message: 'History saved successfully',
      data: history,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  async getSeriesHistory(@Req() req: any, @Query('seriesId') seriesId: string) {
    const userId = req.user.userId;
    const data = await this.cartoonService.getSeriesHistory(userId, seriesId);
    return {
      status: 200,
      data,
    };
  }
}
