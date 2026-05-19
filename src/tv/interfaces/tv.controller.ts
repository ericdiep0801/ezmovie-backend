import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { TvService } from '../application/tv.service';
import { AddTvFavoriteDto } from '../application/dto/add-tv-favorite.dto';
import { AddTvHistoryDto } from '../application/dto/add-tv-history.dto';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';

@Controller('tv')
export class TvController {
  constructor(private readonly tvService: TvService) {}

  // 1. Get list of all TV channels (supports category and search filters)
  @Get('channels')
  async getChannels(
    @Query('category') category?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.tvService.getChannels(category, keyword);
  }

  // 2. Get all distinct categories
  @Get('categories')
  async getCategories() {
    return this.tvService.getCategories();
  }

  // 3. Get detailed TV Channel information (with mock EPG & custom favorite state)
  @Get('channels/detail/:slug')
  async getChannelBySlug(@Request() req, @Param('slug') slug: string) {
    let userId: number | undefined = undefined;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = payload.userId || payload.sub;
      } catch (e) {}
    }
    return this.tvService.getChannelBySlug(slug, userId);
  }

  // 4. Toggle Favorite (authenticated)
  @UseGuards(JwtAuthGuard)
  @Post('favorite/toggle')
  async toggleFavorite(@Request() req, @Body() dto: AddTvFavoriteDto) {
    const userId = req.user.userId || req.user.sub;
    return this.tvService.toggleFavorite(userId, dto);
  }

  // 5. List Favorites (authenticated)
  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  async listFavorites(@Request() req) {
    const userId = req.user.userId || req.user.sub;
    return this.tvService.listFavorites(userId);
  }

  // 6. Save Watch History (authenticated)
  @UseGuards(JwtAuthGuard)
  @Post('history')
  async addWatchHistory(@Request() req, @Body() dto: AddTvHistoryDto) {
    const userId = req.user.userId || req.user.sub;
    return this.tvService.addWatchHistory(userId, dto);
  }

  // 7. Get Watch History list (authenticated)
  @UseGuards(JwtAuthGuard)
  @Get('history')
  async listWatchHistory(@Request() req) {
    const userId = req.user.userId || req.user.sub;
    return this.tvService.listWatchHistory(userId);
  }

  // 8. Clear Watch History (authenticated)
  @UseGuards(JwtAuthGuard)
  @Delete('history')
  async clearWatchHistory(@Request() req) {
    const userId = req.user.userId || req.user.sub;
    return this.tvService.clearWatchHistory(userId);
  }

  // 9. Sync/Import IPTV playlist from M3U URL (Full dynamic IPTV support!)
  @Post('sync')
  async syncFromM3u(
    @Body() body: { url: string; cleanExisting?: boolean },
  ) {
    const m3uUrl = body.url || 'https://iptv-org.github.io/iptv/countries/vn.m3u';
    const cleanExisting = body.cleanExisting ?? false;
    return this.tvService.syncFromM3u(m3uUrl, cleanExisting);
  }
}
