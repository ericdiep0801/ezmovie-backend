import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MoviesService } from '../../application/movies.service';
import { AddFavoriteDto } from '../../application/dto/add-favorite.dto';
import { AddHistoryDto } from '../../application/dto/add-history.dto';
import { GqlAuthGuard } from '../../../auth/infrastructure/guards/gql-auth.guard';
import { CurrentUser } from '../../../auth/infrastructure/decorators/current-user.decorator';
import {
  MovieListResponse,
  MovieDetailResponse,
  FavoriteListResponse,
  WatchHistoryResponse,
  FavoriteToggleResponse,
  CommonResponse,
} from './movie-gql.types';

@Resolver()
export class MoviesResolver {
  constructor(private readonly moviesService: MoviesService) {}

  // 1. Get new movies
  @Query(() => MovieListResponse, { name: 'movies' })
  async getMovies(
    @Args('page', { type: () => Int, nullable: true, defaultValue: 1 }) page: number,
  ) {
    return this.moviesService.getMovies(page);
  }

  // 2. Search movies
  @Query(() => MovieListResponse, { name: 'searchMovies' })
  async searchMovies(
    @Args('keyword') keyword: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 24 }) limit: number,
  ) {
    return this.moviesService.searchMovies(keyword, limit);
  }

  // 3. Movie details
  @Query(() => MovieDetailResponse, { name: 'movieDetail' })
  async getMovieDetails(@Args('slug') slug: string) {
    return this.moviesService.getMovieDetails(slug);
  }

  // 4. Favorites (Authenticated)
  @UseGuards(GqlAuthGuard)
  @Query(() => FavoriteListResponse, { name: 'favorites' })
  async listFavorites(@CurrentUser() user: any) {
    const userId = user.userId || user.sub;
    return this.moviesService.listFavorites(userId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => FavoriteToggleResponse, { name: 'isMovieFavorited' })
  async isFavorited(
    @CurrentUser() user: any,
    @Args('slug') slug: string,
  ) {
    const userId = user.userId || user.sub;
    const result = await this.moviesService.isFavorited(userId, slug);
    return {
      status: result.status,
      message: result.message,
      isFavorited: result.isFavorited,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => FavoriteToggleResponse, { name: 'toggleFavorite' })
  async toggleFavorite(
    @CurrentUser() user: any,
    @Args('addFavoriteDto') dto: AddFavoriteDto,
  ) {
    const userId = user.userId || user.sub;
    return this.moviesService.toggleFavorite(userId, dto);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => CommonResponse, { name: 'addFavorite' })
  async addFavorite(
    @CurrentUser() user: any,
    @Args('addFavoriteDto') dto: AddFavoriteDto,
  ) {
    const userId = user.userId || user.sub;
    const result = await this.moviesService.addFavorite(userId, dto);
    return {
      status: result.status,
      message: result.message,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => CommonResponse, { name: 'removeFavorite' })
  async removeFavorite(
    @CurrentUser() user: any,
    @Args('slug') slug: string,
  ) {
    const userId = user.userId || user.sub;
    const result = await this.moviesService.removeFavorite(userId, slug);
    return {
      status: result.status,
      message: result.message,
    };
  }

  // 5. Watch History (Authenticated)
  @UseGuards(GqlAuthGuard)
  @Query(() => WatchHistoryResponse, { name: 'watchHistory' })
  async listWatchHistory(@CurrentUser() user: any) {
    const userId = user.userId || user.sub;
    return this.moviesService.listWatchHistory(userId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => CommonResponse, { name: 'addWatchHistory' })
  async addWatchHistory(
    @CurrentUser() user: any,
    @Args('addHistoryDto') dto: AddHistoryDto,
  ) {
    const userId = user.userId || user.sub;
    const result = await this.moviesService.addWatchHistory(userId, dto);
    return {
      status: result.status,
      message: result.message,
    };
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => CommonResponse, { name: 'clearWatchHistory' })
  async clearWatchHistory(@CurrentUser() user: any) {
    const userId = user.userId || user.sub;
    const result = await this.moviesService.clearWatchHistory(userId);
    return {
      status: result.status,
      message: result.message,
    };
  }
}
