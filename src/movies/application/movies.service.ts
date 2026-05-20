import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../domain/entities/favorite.entity';
import { WatchHistory } from '../domain/entities/history.entity';
import { Comment } from '../domain/entities/comment.entity';
import { AddFavoriteDto } from './dto/add-favorite.dto';
import { AddHistoryDto } from './dto/add-history.dto';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);
  private readonly BASE_API_URL = 'https://ophim1.com';
  private readonly IMAGE_BASE_URL = 'https://img.ophim.live/uploads/movies';
  private readonly MAX_WATCH_HISTORY = 30;

  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(WatchHistory)
    private readonly watchHistoryRepository: Repository<WatchHistory>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  private resolveImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${this.IMAGE_BASE_URL}/${path}`;
  }

  // 1. Get all movies (newly updated movies from public server)
  async getMovies(page: number = 1, limit: number = 100) {
    this.logger.log(`[MoviesService] Fetching movies list for page ${page}, limit ${limit}`);
    try {
      const itemsPerPage = 24;
      const startItemIndex = (page - 1) * limit;
      const endItemIndex = startItemIndex + limit;
      
      const startPageNum = Math.floor(startItemIndex / itemsPerPage) + 1;
      const endPageNum = Math.ceil(endItemIndex / itemsPerPage);
      
      const fetchPromises: Promise<any>[] = [];
      for (let p = startPageNum; p <= endPageNum; p++) {
        fetchPromises.push(
          fetch(`${this.BASE_API_URL}/danh-sach/phim-moi-cap-nhat?page=${p}`)
            .then(res => {
              if (!res.ok) throw new Error(`Status ${res.status}`);
              return res.json();
            })
            .catch(err => {
              this.logger.error(`Failed to fetch public page ${p}: ${err.message}`);
              return { items: [], pagination: null };
            })
        );
      }
      
      const results = await Promise.all(fetchPromises);
      
      let allItems: any[] = [];
      let lastPaginationObj: any = null;
      for (const res of results) {
        if (res.items) {
          allItems = allItems.concat(res.items);
        }
        if (res.pagination) {
          lastPaginationObj = res.pagination;
        }
      }
      
      const sliceStart = startItemIndex % itemsPerPage;
      const sliceEnd = sliceStart + limit;
      const slicedItems = allItems.slice(sliceStart, sliceEnd);
      
      // Map item images to full absolute paths
      const items = slicedItems.map((item: any) => ({
        ...item,
        thumb_url: this.resolveImageUrl(item.thumb_url),
        poster_url: this.resolveImageUrl(item.poster_url),
      }));

      const totalItems = lastPaginationObj?.totalItems || 1000;
      const totalPages = Math.ceil(totalItems / limit);

      return {
        status: 200,
        message: 'Get movies list successfully',
        items,
        pathImage: this.IMAGE_BASE_URL,
        pagination: {
          totalItems,
          totalItemsPerPage: limit,
          currentPage: page,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error(`[MoviesService] Error in getMovies: ${error.message}`);
      return {
        status: 500,
        message: `Failed to retrieve movies: ${error.message}`,
        items: [],
      };
    }
  }

  // 2. Search movies by keyword
  async searchMovies(keyword: string, page: number = 1, limit: number = 100) {
    this.logger.log(`[MoviesService] Searching movies for keyword: "${keyword}", page: ${page}, limit: ${limit}`);
    try {
      const encodedKeyword = encodeURIComponent(keyword);
      const response = await fetch(`${this.BASE_API_URL}/v1/api/tim-kiem?keyword=${encodedKeyword}&page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch search results: ${response.statusText}`);
      }
      const rawData = await response.json();
      
      if (rawData.status !== 'success') {
        return {
          status: 400,
          message: 'Failed to search movies from server',
          items: [],
        };
      }

      const items = (rawData.data?.items || []).map((item: any) => ({
        ...item,
        thumb_url: this.resolveImageUrl(item.thumb_url),
        poster_url: this.resolveImageUrl(item.poster_url),
      }));

      return {
        status: 200,
        message: 'Search movies successfully',
        items,
        pathImage: this.IMAGE_BASE_URL,
        pagination: rawData.data?.pagination,
      };
    } catch (error) {
      this.logger.error(`[MoviesService] Error in searchMovies: ${error.message}`);
      return {
        status: 500,
        message: `Search movies failed: ${error.message}`,
        items: [],
      };
    }
  }

  // 3. Movie details
  async getMovieDetails(slug: string) {
    this.logger.log(`[MoviesService] Fetching movie details for slug: "${slug}"`);
    try {
      const response = await fetch(`${this.BASE_API_URL}/phim/${slug}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch movie detail: ${response.statusText}`);
      }
      const data = await response.json();

      if (!data.status) {
        return {
          status: 404,
          message: `Movie with slug "${slug}" not found`,
        };
      }

      // Map details
      const movie = data.movie;
      if (movie) {
        movie.thumb_url = this.resolveImageUrl(movie.thumb_url);
        movie.poster_url = this.resolveImageUrl(movie.poster_url);
        
        // Ensure actor and director are mapped to arrays
        if (typeof movie.actor === 'string') {
          movie.actor = movie.actor.split(',').map((a: string) => a.trim()).filter(Boolean);
        } else if (!Array.isArray(movie.actor)) {
          movie.actor = [];
        }

        if (typeof movie.director === 'string') {
          movie.director = movie.director.split(',').map((d: string) => d.trim()).filter(Boolean);
        } else if (!Array.isArray(movie.director)) {
          movie.director = [];
        }
      }

      return {
        status: 200,
        message: 'Get movie details successfully',
        data: {
          movie,
          episodes: data.episodes || [],
        },
      };
    } catch (error) {
      this.logger.error(`[MoviesService] Error in getMovieDetails: ${error.message}`);
      return {
        status: 500,
        message: `Get movie details failed: ${error.message}`,
      };
    }
  }

  // 4. Save Favorite Movies
  async addFavorite(userId: number, dto: AddFavoriteDto) {
    this.logger.log(`[MoviesService] Adding favorite movie: ${dto.movieSlug} for user: ${userId}`);
    if (!dto.movieName || !dto.movieName.trim()) {
      return {
        status: 400,
        message: 'Movie name cannot be empty when adding to favorites',
      };
    }
    try {
      const existing = await this.favoriteRepository.findOne({
        where: { userId, movieSlug: dto.movieSlug },
      });

      if (existing) {
        return {
          status: 200,
          message: 'Movie is already in favorites list',
          data: existing,
        };
      }

      const favorite = this.favoriteRepository.create({
        userId,
        movieSlug: dto.movieSlug,
        movieName: dto.movieName,
        moviePoster: dto.moviePoster ? this.resolveImageUrl(dto.moviePoster) : undefined,
        movieType: dto.movieType,
      });

      const saved = await this.favoriteRepository.save(favorite);
      return {
        status: 201,
        message: 'Movie added to favorites successfully',
        data: saved,
      };
    } catch (error) {
      this.logger.error(`[MoviesService] Error in addFavorite: ${error.message}`);
      return {
        status: 500,
        message: `Add favorite failed: ${error.message}`,
      };
    }
  }

  // Remove favorite
  async removeFavorite(userId: number, movieSlug: string) {
    this.logger.log(`[MoviesService] Removing favorite movie: ${movieSlug} for user: ${userId}`);
    try {
      const existing = await this.favoriteRepository.findOne({
        where: { userId, movieSlug },
      });

      if (!existing) {
        return {
          status: 404,
          message: 'Movie is not in your favorites list',
        };
      }

      await this.favoriteRepository.remove(existing);
      return {
        status: 200,
        message: 'Movie removed from favorites successfully',
      };
    } catch (error) {
      this.logger.error(`[MoviesService] Error in removeFavorite: ${error.message}`);
      return {
        status: 500,
        message: `Remove favorite failed: ${error.message}`,
      };
    }
  }

  // Toggle favorite
  async toggleFavorite(userId: number, dto: AddFavoriteDto) {
    this.logger.log(`[MoviesService] Toggling favorite for ${dto.movieSlug} for user: ${userId}`);
    try {
      const existing = await this.favoriteRepository.findOne({
        where: { userId, movieSlug: dto.movieSlug },
      });

      if (existing) {
        await this.favoriteRepository.remove(existing);
        return {
          status: 200,
          message: 'Removed from favorites list',
          isFavorited: false,
        };
      } else {
        if (!dto.movieName || !dto.movieName.trim()) {
          return {
            status: 400,
            message: 'Movie name cannot be empty when adding to favorites',
          };
        }
        const favorite = this.favoriteRepository.create({
          userId,
          movieSlug: dto.movieSlug,
          movieName: dto.movieName,
          moviePoster: dto.moviePoster ? this.resolveImageUrl(dto.moviePoster) : undefined,
          movieType: dto.movieType,
        });
        await this.favoriteRepository.save(favorite);
        return {
          status: 200,
          message: 'Added to favorites list',
          isFavorited: true,
        };
      }
    } catch (error) {
      this.logger.error(`[MoviesService] Error in toggleFavorite: ${error.message}`);
      return {
        status: 500,
        message: `Toggle favorite failed: ${error.message}`,
      };
    }
  }

  // List favorites
  async listFavorites(userId: number) {
    this.logger.log(`[MoviesService] Listing favorites for user: ${userId}`);
    try {
      const favorites = await this.favoriteRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      return {
        status: 200,
        message: 'Get favorites list successfully',
        data: favorites,
      };
    } catch (error) {
      this.logger.error(`[MoviesService] Error in listFavorites: ${error.message}`);
      return {
        status: 500,
        message: `Get favorites failed: ${error.message}`,
        data: [],
      };
    }
  }

  // Is movie favorited
  async isFavorited(userId: number, movieSlug: string) {
    try {
      const favorite = await this.favoriteRepository.findOne({
        where: { userId, movieSlug },
      });
      return {
        status: 200,
        message: 'Checked favorite status',
        isFavorited: !!favorite,
      };
    } catch (error) {
      return {
        status: 500,
        message: `Check favorite status failed: ${error.message}`,
        isFavorited: false,
      };
    }
  }

  // 5. Watch History
  async addWatchHistory(userId: number, dto: AddHistoryDto) {
    this.logger.log(`[MoviesService] Tracking history: ${dto.movieSlug} (ep: ${dto.episodeName}) for user: ${userId}`);
    try {
      // Duplicate: remove old entry so the movie moves to the top with fresh timestamps
      await this.watchHistoryRepository.delete({ userId, movieSlug: dto.movieSlug });

      const history = this.watchHistoryRepository.create({
        userId,
        movieSlug: dto.movieSlug,
        movieName: dto.movieName,
        moviePoster: dto.moviePoster ? this.resolveImageUrl(dto.moviePoster) : undefined,
        episodeName: dto.episodeName,
        episodeSlug: dto.episodeSlug,
      });

      const saved = await this.watchHistoryRepository.save(history);

      // Cap at MAX_WATCH_HISTORY: drop oldest entries (by updatedAt)
      const count = await this.watchHistoryRepository.count({ where: { userId } });
      if (count > this.MAX_WATCH_HISTORY) {
        const excess = count - this.MAX_WATCH_HISTORY;
        const oldest = await this.watchHistoryRepository.find({
          where: { userId },
          order: { updatedAt: 'ASC' },
          take: excess,
        });
        if (oldest.length > 0) {
          await this.watchHistoryRepository.delete(oldest.map((h) => h.id));
        }
      }

      return {
        status: 200,
        message: 'Watch history updated successfully',
        data: saved,
      };
    } catch (error) {
      this.logger.error(`[MoviesService] Error in addWatchHistory: ${error.message}`);
      return {
        status: 500,
        message: `Save watch history failed: ${error.message}`,
      };
    }
  }

  // List watch history
  async listWatchHistory(userId: number) {
    this.logger.log(`[MoviesService] Listing watch history for user: ${userId}`);
    try {
      const history = await this.watchHistoryRepository.find({
        where: { userId },
        order: { updatedAt: 'DESC' },
        take: this.MAX_WATCH_HISTORY,
      });

      return {
        status: 200,
        message: 'Get watch history successfully',
        data: history,
      };
    } catch (error) {
      this.logger.error(`[MoviesService] Error in listWatchHistory: ${error.message}`);
      return {
        status: 500,
        message: `Get watch history failed: ${error.message}`,
        data: [],
      };
    }
  }

  // Clear watch history
  async clearWatchHistory(userId: number) {
    this.logger.log(`[MoviesService] Clearing watch history for user: ${userId}`);
    try {
      await this.watchHistoryRepository.delete({ userId });
      return {
        status: 200,
        message: 'Watch history cleared successfully',
      };
    } catch (error) {
      this.logger.error(`[MoviesService] Error in clearWatchHistory: ${error.message}`);
      return {
        status: 500,
        message: `Clear watch history failed: ${error.message}`,
      };
    }
  }

  // Delete specific watch history item
  async deleteWatchHistoryItem(userId: number, movieSlug: string) {
    this.logger.log(`[MoviesService] Deleting watch history for user: ${userId}, movie: ${movieSlug}`);
    try {
      await this.watchHistoryRepository.delete({ userId, movieSlug });
      return {
        status: 200,
        message: 'Watch history item deleted successfully',
      };
    } catch (error) {
      this.logger.error(`[MoviesService] Error in deleteWatchHistoryItem: ${error.message}`);
      return {
        status: 500,
        message: `Delete watch history item failed: ${error.message}`,
      };
    }
  }

  // 7. Movie Comments System
  async addComment(userId: number, movieSlug: string, content: string) {
    this.logger.log(`[MoviesService] Adding comment for user ${userId} on movie ${movieSlug}`);
    if (!content || !content.trim()) {
      return {
        status: 400,
        message: 'Comment content cannot be empty',
      };
    }

    try {
      const comment = new Comment();
      comment.userId = userId;
      comment.movieSlug = movieSlug;
      comment.content = content.trim();
      comment.likesCount = 0;
      comment.likedUserIds = JSON.stringify([]);

      await this.commentRepository.save(comment);

      return {
        status: 200,
        message: 'Comment added successfully',
        data: comment,
      };
    } catch (error) {
      this.logger.error(`[MoviesService] Error in addComment: ${error.message}`);
      return {
        status: 500,
        message: `Add comment failed: ${error.message}`,
      };
    }
  }

  async listComments(movieSlug: string, currentUserId?: number) {
    this.logger.log(`[MoviesService] Listing comments for movie ${movieSlug}`);
    try {
      const comments = await this.commentRepository.find({
        where: { movieSlug },
        order: { createdAt: 'DESC' },
      });

      const formatted = comments.map(c => {
        let likedIds: number[] = [];
        try {
          likedIds = c.likedUserIds ? JSON.parse(c.likedUserIds) : [];
        } catch(e) {}

        const hasLiked = currentUserId ? likedIds.includes(currentUserId) : false;

        return {
          id: c.id,
          content: c.content,
          likesCount: c.likesCount,
          createdAt: c.createdAt,
          hasLiked,
          user: c.user ? {
            id: c.user.id,
            username: c.user.username,
            avatar: c.user.avatar,
          } : null,
        };
      });

      return {
        status: 200,
        message: 'Get comments list successfully',
        data: formatted,
      };
    } catch (error) {
      this.logger.error(`[MoviesService] Error in listComments: ${error.message}`);
      return {
        status: 500,
        message: `Get comments list failed: ${error.message}`,
      };
    }
  }

  async toggleLikeComment(userId: number, commentId: number) {
    this.logger.log(`[MoviesService] Toggling like for user ${userId} on comment ${commentId}`);
    try {
      const comment = await this.commentRepository.findOne({
        where: { id: commentId },
      });

      if (!comment) {
        return {
          status: 404,
          message: 'Comment not found',
        };
      }

      let likedIds: number[] = [];
      try {
        likedIds = comment.likedUserIds ? JSON.parse(comment.likedUserIds) : [];
      } catch(e) {
        likedIds = [];
      }

      const index = likedIds.indexOf(userId);
      let hasLiked = false;

      if (index === -1) {
        // Like comment
        likedIds.push(userId);
        comment.likesCount += 1;
        hasLiked = true;
      } else {
        // Unlike comment
        likedIds.splice(index, 1);
        comment.likesCount = Math.max(0, comment.likesCount - 1);
        hasLiked = false;
      }

      comment.likedUserIds = JSON.stringify(likedIds);
      await this.commentRepository.save(comment);

      return {
        status: 200,
        message: hasLiked ? 'Liked comment successfully' : 'Unliked comment successfully',
        data: {
          likesCount: comment.likesCount,
          hasLiked,
        },
      };
    } catch (error) {
      this.logger.error(`[MoviesService] Error in toggleLikeComment: ${error.message}`);
      return {
        status: 500,
        message: `Toggle like failed: ${error.message}`,
      };
    }
  }
}
