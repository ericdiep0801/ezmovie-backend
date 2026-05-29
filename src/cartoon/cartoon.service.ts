import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartoonHistory } from './entities/cartoon-history.entity';

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

  constructor(
    @InjectRepository(CartoonHistory)
    private readonly cartoonHistoryRepository: Repository<CartoonHistory>,
  ) {}

  // Series List (Directly mapped to KKPhim high-speed HLS anime databases)
  private readonly seriesList: CartoonSeries[] = [
    {
      id: 'doraemon',
      name: 'Doraemon - Tập Ngắn & The Movie',
      originalName: 'ドラえもん',
      coverUrl: 'https://phimimg.com/upload/vod/20250108-1/008f74495954be77b6495b44c98ce6b4.png',
      description: 'Trọn bộ các tập phim ngắn và các phần phim chiếu rạp (The Movie) lồng tiếng Việt siêu đáng yêu và đầy ắp những phép thuật nhiệm màu từ chiếc túi thần kỳ của chú mèo máy Doraemon và Nobita.',
      tags: ['Tập Ngắn', 'The Movie', 'Nobita', 'Bảo Bối', 'Lồng Tiếng HD', 'Premium HLS'],
      rating: 4.9,
      episodesCount: '80+ Tập HD & The Movie',
      category: 'Anime',
      ophimSlug: 'doraemon-tuyen-tap-moi-nhat',
      ophimSlugs: [
        'doraemon-tuyen-tap-moi-nhat',
        'doraemon-doi-ban-than',
        'doraemon-doi-ban-than-2',
        'doraemon-nobita-va-nhung-hiep-si-khong-gian',
        'doraemon-nobita-va-nhung-phap-su-gio-bi-an',
        'doraemon-nobita-va-nhung-ban-khung-long-moi',
        'doraemon-nobita-va-cuoc-chien-vu-tru-ti-hon',
        'doraemon-nobita-va-vung-dat-ly-tuong-tren-bau-troi',
        'doraemon-nobita-va-vien-bao-tang-bao-boi',
        'doraemon-nobita-va-mat-trang-phieu-luu-ky',
        'doraemon-nobita-va-ban-giao-huong-dia-cau',
        'doraemon-nobita-va-binh-doan-nguoi-sat',
        'doraemon-nobita-va-cuoc-dai-thuy-chien-o-xu-so-nguoi-ca',
        'doraemon-nobita-va-chuyen-tham-hiem-nam-cuc-kachi-kochi',
        'doraemon-nobita-va-cuoc-phieu-luu-vao-the-gioi-trong-tranh',
        'doraemon-the-movie-nobita-and-the-green-giant-legend',
        'doraemon-nobita-tham-hiem-vung-dat-moi',
        'doraemon-the-movie-nobitas-new-great-adventure-into-the-underworld',
        'doraemon-nobita-tham-hiem-vung-dat-moi-peko-va-5-nha-tham-hiem',
        'doraemon-nobita-va-nhung-dung-si-co-canh',
        'doraemon-nobita-va-chuyen-tau-toc-hanh-ngan-ha',
        'doraemon-nobita-va-me-cung-thiec',
        'doraemon-nobita-du-hanh-bien-phuong-nam',
        'doraemon-nobita-va-cuoc-phieu-luu-o-thanh-pho-day-cot',
        'doraemon-nobita-va-hon-dao-dieu-ki-cuoc-phieu-luu-cua-loai-thu',
        'doraemon-nobita-va-truyen-thuyet-vua-mat-troi',
        'doraemon-nobita-vu-tru-phieu-luu-ki',
        'doraemon-nobita-va-ba-chang-hiep-si-mong-mo',
        'doraemon-nobita-va-vuong-quoc-tren-may',
        'doraemon-nobita-va-vuong-quoc-robot',
        'doraemon-nobita-o-vuong-quoc-cho-meo',
        'doraemon-nobita-o-xu-so-nghin-le-mot-dem',
        'doraemon-nobita-va-hanh-tinh-muong-thu',
        'doraemon-nobita-va-nuoc-nhat-thoi-nguyen-thuy-1989',
        'doraemon-nobita-tay-du-ki',
        'doraemon-nobita-va-hiep-si-rong',
        'doraemon-nobita-va-binh-doan-nguoi-sat-1986',
        'doraemon-nobita-va-cuoc-chien-vu-tru',
        'doraemon-nobita-va-chuyen-phieu-luu-vao-xu-quy-1984',
        'doraemon-nobita-va-lau-dai-duoi-day-bien',
        'doraemon-nobita-va-lich-su-khai-pha-vu-tru-1981',
        'doraemon-chu-khung-long-cua-nobita-1980',
        'doraemon-nobita-va-dao-giau-vang',
        'doraemon-nobita-va-nuoc-nhat-thoi-nguyen-thuy',
        'doraemon-nobita-va-lich-su-khai-pha-vu-tru',
        'doraemon-nobita-va-nguoi-khong-lo-xanh',
        'doraemon-nobita-va-chuyen-phieu-luu-vao-xu-quy',
        'doraemon-chu-khung-long-cua-nobita',
        'doraemon-tuyen-tap-phim-giang-sinh'
      ],
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

      // Deduplicate across multi-slug fetches then filter
      const uniqueEpisodes = this.deduplicateEpisodes(episodes);
      
      // NguonC server is currently dead (sing.phimmoi.net), and Youtube is not preferred by user.
      // Removed the special injected episode.

      return this.filterByKeyword(uniqueEpisodes, keyword);
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
   * Remove duplicate episodes by id. Keeps first occurrence (preserves source order).
   */
  private deduplicateEpisodes(episodes: CartoonEpisode[]): CartoonEpisode[] {
    const seen = new Set<string>();
    const unique: CartoonEpisode[] = [];
    for (const ep of episodes) {
      if (!seen.has(ep.id)) {
        seen.add(ep.id);
        unique.push(ep);
      }
    }
    return unique;
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
    // Seen slugs for dedup across all servers
    const seenSlugs = new Set<string>();

    // Merge episodes from ALL servers (not just [0])
    // Each server (Hà Nội, HCM, ...) may have a different subset of episodes
    for (const server of data.episodes) {
      const serverData: any[] = server.server_data || [];
      for (let i = 0; i < serverData.length; i++) {
        const ep = serverData[i];
        const epSlug: string = ep.slug || `${server.server_name}-${i}`;

        // Skip duplicate episode slugs already seen from other servers
        if (seenSlugs.has(epSlug)) continue;
        seenSlugs.add(epSlug);

        let episodeNum: string = ep.name || `${i + 1}`;
        episodeNum = episodeNum.replace(/^Tập\s+/i, '').trim();

        episodesList.push({
          id: `ophim-${slug}-${epSlug}`,
          title: `${seriesLabel} - Tập ${episodeNum}`,
          slug: epSlug,
          thumbnailUrl: thumbUrl,
          linkEmbed: ep.link_embed || '',
          linkM3u8: ep.link_m3u8 || '',
          duration: '21:00',
          views: 'FHD Rõ Nét',
          publishDate: server.server_name || 'Máy Chủ Phim',
        });
      }
    }

    // Sort by episode number ascending
    episodesList.sort((a, b) => {
      const numA = parseInt(a.title.replace(/.*Tập\s*/i, ''), 10) || 0;
      const numB = parseInt(b.title.replace(/.*Tập\s*/i, ''), 10) || 0;
      return numA - numB;
    });

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

  async saveHistory(userId: number, seriesId: string, episodeId: string, progressPercent: number): Promise<CartoonHistory> {
    let history = await this.cartoonHistoryRepository.findOne({
      where: { userId, episodeId }
    });

    const isCompleted = progressPercent >= 95;

    if (history) {
      history.progressPercent = progressPercent;
      if (isCompleted) {
        history.isCompleted = true;
      }
      return this.cartoonHistoryRepository.save(history);
    }

    history = this.cartoonHistoryRepository.create({
      userId,
      seriesId,
      episodeId,
      progressPercent,
      isCompleted,
    });

    return this.cartoonHistoryRepository.save(history);
  }

  async getSeriesHistory(userId: number, seriesId: string): Promise<CartoonHistory[]> {
    return this.cartoonHistoryRepository.find({
      where: { userId, seriesId },
      order: { updatedAt: 'DESC' }
    });
  }
}
