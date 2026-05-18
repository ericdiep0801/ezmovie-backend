import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Favorite } from '../../domain/entities/favorite.entity';
import { WatchHistory } from '../../domain/entities/history.entity';

@ObjectType()
export class TMDBInfo {
  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  season?: number;

  @Field(() => Float, { nullable: true })
  vote_average?: number;

  @Field({ nullable: true })
  vote_count?: number;
}

@ObjectType()
export class IMDBInfo {
  @Field({ nullable: true })
  id?: string;

  @Field(() => Float, { nullable: true })
  vote_average?: number;

  @Field({ nullable: true })
  vote_count?: number;
}

@ObjectType()
export class CategoryItem {
  @Field({ nullable: true })
  id?: string;

  @Field()
  name: string;

  @Field()
  slug: string;
}

@ObjectType()
export class CountryItem {
  @Field({ nullable: true })
  id?: string;

  @Field()
  name: string;

  @Field()
  slug: string;
}

@ObjectType()
export class MovieItem {
  @Field()
  _id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  origin_name: string;

  @Field({ nullable: true })
  thumb_url?: string;

  @Field({ nullable: true })
  poster_url?: string;

  @Field({ nullable: true })
  year?: number;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  quality?: string;

  @Field({ nullable: true })
  lang?: string;

  @Field({ nullable: true })
  time?: string;

  @Field({ nullable: true })
  episode_current?: string;

  @Field(() => TMDBInfo, { nullable: true })
  tmdb?: TMDBInfo;

  @Field(() => IMDBInfo, { nullable: true })
  imdb?: IMDBInfo;
}

@ObjectType()
export class PaginationInfo {
  @Field(() => Int)
  totalItems: number;

  @Field(() => Int)
  totalItemsPerPage: number;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  totalPages: number;
}

@ObjectType()
export class MovieListResponse {
  @Field()
  status: number;

  @Field()
  message: string;

  @Field(() => [MovieItem], { nullable: true })
  items?: MovieItem[];

  @Field({ nullable: true })
  pathImage?: string;

  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo;
}

@ObjectType()
export class MovieDetail {
  @Field()
  _id: string;

  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  origin_name: string;

  @Field({ nullable: true })
  content?: string;

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  thumb_url?: string;

  @Field({ nullable: true })
  poster_url?: string;

  @Field({ nullable: true })
  time?: string;

  @Field({ nullable: true })
  episode_current?: string;

  @Field({ nullable: true })
  episode_total?: string;

  @Field({ nullable: true })
  quality?: string;

  @Field({ nullable: true })
  lang?: string;

  @Field({ nullable: true })
  notify?: string;

  @Field({ nullable: true })
  showtimes?: string;

  @Field({ nullable: true })
  year?: number;

  @Field(() => Int, { nullable: true })
  view?: number;

  @Field(() => [String], { nullable: true })
  actor?: string[];

  @Field(() => [String], { nullable: true })
  director?: string[];

  @Field(() => [CategoryItem], { nullable: true })
  category?: CategoryItem[];

  @Field(() => [CountryItem], { nullable: true })
  country?: CountryItem[];
}

@ObjectType()
export class EpisodeServerData {
  @Field()
  name: string;

  @Field()
  slug: string;

  @Field()
  filename: string;

  @Field()
  link_embed: string;

  @Field()
  link_m3u8: string;
}

@ObjectType()
export class EpisodeServer {
  @Field()
  server_name: string;

  @Field(() => [EpisodeServerData])
  server_data: EpisodeServerData[];
}

@ObjectType()
export class MovieDetailData {
  @Field(() => MovieDetail)
  movie: MovieDetail;

  @Field(() => [EpisodeServer])
  episodes: EpisodeServer[];
}

@ObjectType()
export class MovieDetailResponse {
  @Field()
  status: number;

  @Field()
  message: string;

  @Field(() => MovieDetailData, { nullable: true })
  data?: MovieDetailData;
}

@ObjectType()
export class FavoriteListResponse {
  @Field()
  status: number;

  @Field()
  message: string;

  @Field(() => [Favorite], { nullable: true })
  data?: Favorite[];
}

@ObjectType()
export class WatchHistoryResponse {
  @Field()
  status: number;

  @Field()
  message: string;

  @Field(() => [WatchHistory], { nullable: true })
  data?: WatchHistory[];
}

@ObjectType()
export class FavoriteToggleResponse {
  @Field()
  status: number;

  @Field()
  message: string;

  @Field({ nullable: true })
  isFavorited?: boolean;
}

@ObjectType()
export class CommonResponse {
  @Field()
  status: number;

  @Field()
  message: string;
}
