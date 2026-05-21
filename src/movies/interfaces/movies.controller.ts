import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards, Request, ParseIntPipe, Res } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { MoviesService } from '../application/movies.service';
import { AddFavoriteDto } from '../application/dto/add-favorite.dto';
import { AddHistoryDto } from '../application/dto/add-history.dto';
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  // 1. Get list of new movies (paginated)
  @Get()
  async getMovies(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.moviesService.getMovies(pageNum, limitNum);
  }

  // Download M3U8 directly as a combined TS file stream
  @Get('download-stream')
  async downloadStream(
    @Query('url') url: string, 
    @Query('name') name: string, 
    @Query('token') token: string,
    @Res() res: any
  ) {
    try {
      if (!token) {
        return res.status(401).send('Unauthorized. Please login to download.');
      }
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-key-123');
      if (decoded.role !== 'vip' && decoded.role !== 'admin') {
        return res.status(403).send('Forbidden. Only VIP or Admin users can download movies.');
      }
    } catch (err) {
      return res.status(401).send('Invalid token.');
    }
    return this.moviesService.downloadStream(url, name, res);
  }

  // 2. Search movies by keyword
  @Get('search')
  async searchMovies(
    @Query('keyword') keyword: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 100;
    return this.moviesService.searchMovies(keyword || '', pageNum, limitNum);
  }

  // 3. Movie details
  @Get('detail/:slug')
  async getMovieDetails(@Request() req, @Param('slug') slug: string) {
    // Extract IP address from request
    let ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip;
    if (Array.isArray(ip)) ip = ip[0];

    // Optionally extract userId from auth token if available to save their last location IP
    let userId: number | undefined = undefined;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = payload.userId || payload.sub;
      } catch (e) {}
    }

    // Extract user agent for device tracking
    const userAgent = req.headers['user-agent'] || '';

    if (userId && ip) {
      // Don't await to avoid blocking the movie detail response
      this.moviesService.updateUserTracking(userId, ip as string, userAgent).catch(err => {
        console.error('Failed to update user tracking', err);
      });
    }

    return this.moviesService.getMovieDetails(slug);
  }

  // 4. Watch movie (returns streaming episodes & player details)
  @Get('watch/:slug')
  async watchMovie(@Param('slug') slug: string) {
    // Simply fetch movie details, which includes episode lists and HLS/iframe urls
    const result = await this.moviesService.getMovieDetails(slug);
    if (result.status === 200 && result.data) {
      return {
        status: 200,
        message: 'Get watch stream links successfully',
        data: result.data.episodes,
      };
    }
    return result;
  }

  // 5. Toggle favorite status (authenticated)
  @UseGuards(JwtAuthGuard)
  @Post('favorite/toggle')
  async toggleFavorite(@Request() req, @Body() dto: AddFavoriteDto) {
    const userId = req.user.userId || req.user.sub;
    return this.moviesService.toggleFavorite(userId, dto);
  }

  // Add movie to favorites (authenticated)
  @UseGuards(JwtAuthGuard)
  @Post('favorite')
  async addFavorite(@Request() req, @Body() dto: AddFavoriteDto) {
    const userId = req.user.userId || req.user.sub;
    return this.moviesService.addFavorite(userId, dto);
  }

  // Remove movie from favorites (authenticated)
  @UseGuards(JwtAuthGuard)
  @Delete('favorite/:slug')
  async removeFavorite(@Request() req, @Param('slug') slug: string) {
    const userId = req.user.userId || req.user.sub;
    return this.moviesService.removeFavorite(userId, slug);
  }

  // Get favorites list (authenticated)
  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  async listFavorites(@Request() req) {
    const userId = req.user.userId || req.user.sub;
    return this.moviesService.listFavorites(userId);
  }

  // Check if movie is favorited (authenticated)
  @UseGuards(JwtAuthGuard)
  @Get('favorite/check/:slug')
  async isFavorited(@Request() req, @Param('slug') slug: string) {
    const userId = req.user.userId || req.user.sub;
    return this.moviesService.isFavorited(userId, slug);
  }

  // 6. Watch History
  // Save watch history (authenticated)
  @UseGuards(JwtAuthGuard)
  @Post('history')
  async addWatchHistory(@Request() req, @Body() dto: AddHistoryDto) {
    const userId = req.user.userId || req.user.sub;
    return this.moviesService.addWatchHistory(userId, dto);
  }

  // List watch history (authenticated)
  @UseGuards(JwtAuthGuard)
  @Get('history')
  async listWatchHistory(@Request() req) {
    const userId = req.user.userId || req.user.sub;
    return this.moviesService.listWatchHistory(userId);
  }

  // Clear watch history (authenticated)
  @UseGuards(JwtAuthGuard)
  @Delete('history')
  async clearWatchHistory(@Request() req) {
    const userId = req.user.userId || req.user.sub;
    return this.moviesService.clearWatchHistory(userId);
  }

  // Delete specific watch history item (authenticated)
  @UseGuards(JwtAuthGuard)
  @Delete('history/:slug')
  async deleteWatchHistoryItem(@Request() req, @Param('slug') slug: string) {
    const userId = req.user.userId || req.user.sub;
    return this.moviesService.deleteWatchHistoryItem(userId, slug);
  }

  // 7. Movie Comments Endpoints
  // Save comment (authenticated)
  @UseGuards(JwtAuthGuard)
  @Post('comments')
  async addComment(@Request() req, @Body() body: { movieSlug: string, content: string }) {
    const userId = req.user.userId || req.user.sub;
    return this.moviesService.addComment(userId, body.movieSlug, body.content);
  }

  // Get comments list (anyone)
  @Get('comments/:slug')
  async listComments(@Request() req, @Param('slug') slug: string) {
    let userId: number | undefined = undefined;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = payload.userId || payload.sub;
      } catch (e) {}
    }
    return this.moviesService.listComments(slug, userId);
  }

  // Like or unlike a comment (authenticated)
  @UseGuards(JwtAuthGuard)
  @Post('comments/:id/like')
  async toggleLikeComment(@Request() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.userId || req.user.sub;
    return this.moviesService.toggleLikeComment(userId, id);
  }
}
