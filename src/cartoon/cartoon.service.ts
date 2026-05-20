import { Injectable, Logger } from '@nestjs/common';

export interface CartoonSeries {
  id: string;
  name: string;
  originalName: string;
  coverUrl: string;
  description: string;
  tags: string[];
  rating: number;
  episodesCount: string;
  category: string;
  ophimSlug: string;
  /** Optional: multiple slugs — episodes from all slugs fetched in parallel & merged into one list */
  ophimSlugs?: string[];
}

export interface CartoonEpisode {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string;
  linkEmbed: string;
  linkM3u8: string;
  duration: string;
  views: string;
  publishDate: string;
}

@Injectable()
export class CartoonService {
  private readonly logger = new Logger(CartoonService.name);
  private readonly BASE_API_URL = 'https://phimapi.com';
  private readonly IMAGE_BASE_URL = 'https://phimimg.com';

  // Series List (Directly mapped to KKPhim high-speed HLS anime databases)
  private readonly seriesList: CartoonSeries[] = [
    {
      id: 'doraemon',
      name: 'Doraemon - Tập Ngắn',
      originalName: 'ドラえもん',
      coverUrl: 'https://phimimg.com/upload/vod/20250108-1/008f74495954be77b6495b44c98ce6b4.png',
      description: 'Trọn bộ các tập phim ngắn lồng tiếng Việt siêu đáng yêu và đầy ắp những phép thuật nhiệm màu từ chiếc túi thần kỳ của chú mèo máy Doraemon và Nobita.',
      tags: ['Tập Ngắn', 'Nobita', 'Bảo Bối', 'Lồng Tiếng HD', 'Premium HLS'],
      rating: 4.9,
      episodesCount: '64 Tập Ngắn HD',
      category: 'Anime',
      ophimSlug: 'doraemon-tuyen-tap-moi-nhat',
    },
    {
      id: 'shin',
      name: 'Shin - Cậu Bé Bút Chì',
      originalName: 'クレヨンしんちゃん',
      coverUrl: 'https://phimimg.com/upload/vod/20250109-1/0d5ed7b632f6dc92b4761c7ceb570249.jpg',
      description: 'Những cuộc phiêu lưu đầy ắp tiếng cười tinh nghịch của chú bé 5 tuổi Shinnosuke và gia đình Nohara lồng tiếng HD trọn bộ cực hay.',
      tags: ['Shin-chan TV', 'Gia đình Nohara', 'Hài Hước HD', 'Premium HLS'],
      rating: 4.8,
      episodesCount: '300 Tập Ngắn HD',
      category: 'Hài Hước',
      ophimSlug: 'shin',
    },
    {
      id: 'conan',
      name: 'Thám Tử Lừng Danh Conan',
      originalName: '名探偵コナン',
      coverUrl: 'https://phimimg.com/upload/vod/20240310-1/2a39971cc29c2802259b918eb437a45b.jpg',
      description: 'Trọn bộ phim dài tập Thám tử lừng danh Conan từ tập 1 thuyết minh lồng tiếng HD mượt mà nét căng từ máy chủ phim chuyên nghiệp.',
      tags: ['Phá án', 'Trinh thám', 'Lồng Tiếng HD', 'Full Series', 'Film Server'],
      rating: 4.8,
      episodesCount: '1180+ Tập HD',
      category: 'Trinh Thám',
      ophimSlug: 'tham-tu-lung-danh-conan',
    },
    {
      id: 'one-piece',
      name: 'Đảo Hải Tặc - One Piece',
      originalName: 'ワンピース',
      coverUrl: 'https://phimimg.com/upload/vod/20240310-1/d61250d0c1670917fd783a1b48cbb29c.jpg',
      description: 'Hành trình vượt khơi xa xôi của Monkey D. Luffy và băng hải tặc Mũ Rơm đầy dũng cảm bản Vietsub HD chính thức sắc nét và mượt mà.',
      tags: ['Băng Mũ Rơm', 'Vietsub HD', 'Đại Hải Trình', 'Full Series', 'Film Server'],
      rating: 4.9,
      episodesCount: '1170+ Tập HD',
      category: 'Anime',
      ophimSlug: 'dao-hai-tac',
    },
    {
      id: 'kamen-rider',
      name: 'Kamen Rider - Tổng Hợp',
      originalName: '仮面ライダー シリーズ',
      coverUrl: 'https://phimimg.com/upload/vod/20241013-1/c06352fe1d936de3abcd1eade80d648d.jpg',
      description: 'Tổng hợp toàn bộ các series Kamen Rider Reiwa Era hay nhất: Geats, Revice, ZERO-ONE và Saber — gộp thành một danh sách xem liền mạch vietsub FHD siêu mượt.',
      tags: ['Geats', 'Revice', 'ZERO-ONE', 'Saber', 'Vietsub FHD', 'Tổng Hợp'],
      rating: 4.9,
      episodesCount: '193+ Tập FHD',
      category: 'Kamen Rider',
      // Primary slug (fallback)
      ophimSlug: 'hiep-si-mat-na-dau-truong-tham-vong',
      // All 4 Reiwa-era series fetched & merged into one combined list
      ophimSlugs: [
        'hiep-si-mat-na-dau-truong-tham-vong', // Kamen Rider: Geats (49 tập)
        'hiep-si-mat-na-khe-uoc-ac-ma',         // Kamen Rider: Revice (50 tập)
        'hiep-si-mat-na-hiem-hoa-ai',            // Kamen Rider: ZERO-ONE (46 tập)
        'hiep-si-mat-na-saber',                  // Kamen Rider: Saber (48 tập)
      ],
    },
  ];

  getSeriesList(): CartoonSeries[] {
    return this.seriesList;
  }

  getSeriesById(id: string): CartoonSeries | undefined {
    return this.seriesList.find((s) => s.id === id);
  }

  /**
   * Resolve movie embed link dynamically on-demand (speeds up catalog load times)
   */
  async getEpisodeEmbed(slug: string): Promise<{ linkEmbed: string; linkM3u8: string }> {
    try {
      this.logger.log(`Fetching direct movie server embed link for slug: "${slug}"`);
      const url = `${this.BASE_API_URL}/phim/${slug}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`KKPhim details call failed with status ${response.status}`);
      const data = await response.json();

      const server = data.episodes?.[0];
      const ep = server?.server_data?.[0];

      return {
        linkEmbed: ep?.link_embed || '',
        linkM3u8: ep?.link_m3u8 || '',
      };
    } catch (e) {
      this.logger.error(`Failed to load dynamic embed for ${slug}`, e);
      return { linkEmbed: '', linkM3u8: '' };
    }
  }

  /**
   * Fetches official cartoon episodes in real-time from KKPhim stable high-speed film servers.
   * Supports multi-slug series: fetches each slug in parallel and merges all episodes into one list.
   */
  async getEpisodes(seriesId: string, keyword?: string): Promise<CartoonEpisode[]> {
    const series = this.getSeriesById(seriesId);
    if (!series) return [];

    this.logger.log(`Retrieving episodes for series "${seriesId}" from stable film API`);

    try {
      let episodes: CartoonEpisode[];

      if (series.ophimSlugs && series.ophimSlugs.length > 1) {
        // Multi-slug: fetch all in parallel then merge sequentially
        episodes = await this.fetchMultipleSlugs(series.ophimSlugs, series);
      } else {
        episodes = await this.fetchEpisodesFromOPhim(series.ophimSlug, series, false);
      }

      return this.filterByKeyword(episodes, keyword);
    } catch (error) {
      this.logger.error(`Failed to retrieve episodes for ${seriesId}`, error);
      return this.getMockEpisodes(seriesId);
    }
  }

  /**
   * Fetch episodes from multiple slugs in parallel and merge into one ordered list.
   * Each episode title is prefixed with the slug's own origin_name from the API for clarity.
   */
  private async fetchMultipleSlugs(
    slugs: string[],
    series: CartoonSeries,
  ): Promise<CartoonEpisode[]> {
    const results = await Promise.allSettled(
      slugs.map((slug) => this.fetchEpisodesFromOPhim(slug, series, true)),
    );

    const merged: CartoonEpisode[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        merged.push(...result.value);
      } else {
        this.logger.warn(`One slug failed to load during multi-fetch: ${result.reason}`);
      }
    }
    return merged;
  }

  private filterByKeyword(episodes: CartoonEpisode[], keyword?: string): CartoonEpisode[] {
    if (!keyword || !keyword.trim()) return episodes;
    const cleanKw = keyword.toLowerCase().trim();
    return episodes.filter((ep) => ep.title.toLowerCase().includes(cleanKw));
  }

  /**
   * Fetch episodes from a single OPhim slug.
   * @param useOriginName - if true, prefix title with the movie's origin_name from the API response
   *                        (used in multi-slug mode to label which Kamen Rider series each ep belongs to)
   */
  private async fetchEpisodesFromOPhim(
    slug: string,
    series: CartoonSeries,
    useOriginName: boolean,
  ): Promise<CartoonEpisode[]> {
    const url = `${this.BASE_API_URL}/phim/${slug}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to connect to KKPhim API for slug "${slug}": Status ${response.status}`);
    }

    const data = await response.json();
    if (!data.status || !data.episodes || data.episodes.length === 0) {
      throw new Error(`No episodes found for slug "${slug}"`);
    }

    const movieDetails = data.movie;

    const thumbUrl = movieDetails?.thumb_url
      ? movieDetails.thumb_url.startsWith('http')
        ? movieDetails.thumb_url
        : `${this.IMAGE_BASE_URL}/${movieDetails.thumb_url}`
      : series.coverUrl;

    // In multi-slug mode: use the API's own origin_name so the viewer knows which series they are watching
    const seriesLabel =
      useOriginName && movieDetails?.origin_name
        ? movieDetails.origin_name
        : series.name.split(' - ')[0];

    const episodesList: CartoonEpisode[] = [];

    // Use first available server data
    const server = data.episodes[0];
    const serverData = server.server_data || [];

    for (let i = 0; i < serverData.length; i++) {
      const ep = serverData[i];
      let episodeNum: string = ep.name || `${i + 1}`;
      episodeNum = episodeNum.replace(/^Tập\s+/i, '').trim();

      episodesList.push({
        id: `ophim-${slug}-${ep.slug || i}`,
        title: `${seriesLabel} - Tập ${episodeNum}`,
        slug: ep.slug,
        thumbnailUrl: thumbUrl,
        linkEmbed: ep.link_embed || '',
        linkM3u8: ep.link_m3u8 || '',
        duration: '24:00',
        views: 'FHD Rõ Nét',
        publishDate: 'Máy Chủ Phim',
      });
    }

    return episodesList;
  }

  private getMockEpisodes(seriesId: string): CartoonEpisode[] {
    const names: Record<string, string> = {
      doraemon: 'Doraemon',
      shin: 'Shin Bút Chì',
      conan: 'Conan',
      'one-piece': 'One Piece',
      'kamen-rider': 'Kamen Rider',
    };
    const seriesName = names[seriesId] ?? 'Unknown';

    return Array.from({ length: 20 }, (_, index) => {
      const epNum = index + 1;
      return {
        id: `mock-${seriesId}-${epNum}`,
        title: `${seriesName} - Tập ${epNum} (HD Server Phim)`,
        slug: `tap-${epNum}`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80',
        linkEmbed: 'https://embed.opstream.me/video/mock',
        linkM3u8: 'https://vip.opstream.me/video/mock/index.m3u8',
        duration: '22:15',
        views: 'HD Rõ Nét',
        publishDate: 'Máy Chủ Phim',
      };
    });
  }
}
