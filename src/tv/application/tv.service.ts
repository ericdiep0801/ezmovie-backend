import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { TvChannel } from '../domain/entities/tv-channel.entity';
import { TvFavorite } from '../domain/entities/tv-favorite.entity';
import { TvHistory } from '../domain/entities/tv-history.entity';
import { AddTvFavoriteDto } from './dto/add-tv-favorite.dto';
import { AddTvHistoryDto } from './dto/add-tv-history.dto';

@Injectable()
export class TvService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TvService.name);

  // Curated premium Vietnamese & International TV channels list for high reliability & stunning presentation
  private readonly DEFAULT_CHANNELS = [
    {
      name: 'VTV1 HD (Siêu Tốc)',
      slug: 'vtv1-hd',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/VTV1_logo_2023.png',
      streamUrl: 'https://liveh12.vtvprime.vn/hls/VTV1_HD/index.m3u8',
      category: 'VTV',
      groupTitle: 'VTV',
    },
    {
      name: 'VTV3 HD (Siêu Tốc)',
      slug: 'vtv3-hd',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/VTV3_logo_2023.png',
      streamUrl: 'https://liveh12.vtvprime.vn/hls/VTV3_HD/index.m3u8',
      category: 'VTV',
      groupTitle: 'VTV',
    },
    {
      name: 'VTV5 HD (Tây Nguyên)',
      slug: 'vtv5-hd',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/VTV5_logo_2023.png',
      streamUrl: 'https://liveh12.vtvprime.vn/hls/VTV5_TN/index.m3u8',
      category: 'VTV',
      groupTitle: 'VTV',
    },
    {
      name: 'ANTV (An Ninh TV)',
      slug: 'antv-hd',
      logo: 'https://static.wikia.nocookie.net/logos/images/1/1a/ANTV_2023.png',
      streamUrl: 'https://liveh12.vtvprime.vn/hls/ANNINHTV/index.m3u8',
      category: 'VTV',
      groupTitle: 'VTV',
    },
    {
      name: 'QPVN (Quốc Phòng VN)',
      slug: 'qpvn-hd',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Logo_QPVN.svg/512px-Logo_QPVN.svg.png',
      streamUrl: 'https://liveh12.vtvprime.vn/hls/QPTV/index.m3u8',
      category: 'VTV',
      groupTitle: 'VTV',
    },
    {
      name: 'HTV Key (Giáo Dục)',
      slug: 'htv-key-hd',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Logo_HTV_Key.png',
      streamUrl: 'https://liveh12.vtvprime.vn/hls/HTVKey/index.m3u8',
      category: 'HTV',
      groupTitle: 'HTV',
    },
    {
      name: 'Đồng Tháp TV',
      slug: 'thdt-hd',
      logo: 'https://i.ibb.co/XFX7yw0/logo2-1.png',
      streamUrl: 'https://liveh34.vtvprime.vn/hls/DONGTHAPTV/index.m3u8',
      category: 'HTV',
      groupTitle: 'HTV',
    },
    {
      name: 'THVL1 HD (Siêu Tốc)',
      slug: 'thvl1-hd',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Logo_THVL1.png/512px-Logo_THVL1.png',
      streamUrl: 'https://liveh12.vtvprime.vn/hls/THVL1/index.m3u8',
      category: 'HTV',
      groupTitle: 'HTV',
    },
    {
      name: 'THVL2 HD (Siêu Tốc)',
      slug: 'thvl2-hd',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Logo_THVL2.png/512px-Logo_THVL2.png',
      streamUrl: 'https://liveh12.vtvprime.vn/hls/THVL2/index.m3u8',
      category: 'HTV',
      groupTitle: 'HTV',
    },
    {
      name: 'SCTV Phim Tổng Hợp',
      slug: 'sctv-phim-hd',
      logo: 'https://i.imgur.com/R8EBxJj.png',
      streamUrl: 'https://liveh12.vtvprime.vn/hls/SCTVPHIM/03.m3u8',
      category: 'SCTV',
      groupTitle: 'SCTV',
    },
    {
      name: 'SCTV1 (Kênh Hài)',
      slug: 'sctv1-hd',
      logo: 'https://i.imgur.com/UcMXcHF.png',
      streamUrl: 'https://liveh12.vtvprime.vn/hls/SCTV1/index.m3u8',
      category: 'SCTV',
      groupTitle: 'SCTV',
    },
    {
      name: 'SCTV2 (Âm Nhạc)',
      slug: 'sctv2-hd',
      logo: 'https://i.imgur.com/8i5DXIg.png',
      streamUrl: 'https://liveh12.vtvprime.vn/hls/SCTV2/index.m3u8',
      category: 'SCTV',
      groupTitle: 'SCTV',
    },
    {
      name: 'SCTV16 (Giải Trí)',
      slug: 'sctv16-hd',
      logo: 'https://i.imgur.com/ldCYtvt.png',
      streamUrl: 'https://liveh34.vtvprime.vn/hls/SCTV16/03.m3u8',
      category: 'SCTV',
      groupTitle: 'SCTV',
    },
    {
      name: 'HBO Premium (Lionsgate)',
      slug: 'hbo-premium',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/512px-HBO_logo.svg.png',
      streamUrl: 'https://amg00353-lionsgatestudio-moviesphere-xumo-zh5u0.amagi.tv/playlist.m3u8',
      category: 'Movies',
      groupTitle: 'HBO',
    },
    {
      name: 'Rakuten Action Movies',
      slug: 'rakuten-action-movies',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Rakuten_TV_logo.svg/512px-Rakuten_TV_logo.svg.png',
      streamUrl: 'https://rakuten-actionmovies-1-us.plex.wurl.tv/playlist.m3u8',
      category: 'Movies',
      groupTitle: 'Movies',
    },
    {
      name: 'Cartoon Network (Tom & Jerry 24/7)',
      slug: 'cartoon-network',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Cartoon_Network_2010_logo.svg/512px-Cartoon_Network_2010_logo.svg.png',
      streamUrl: 'https://live20.bozztv.com/giatvplayout7/giatv-208314/playlist.m3u8',
      category: 'Kids',
      groupTitle: 'Kids',
    },
    {
      name: 'Disney Channel (Mr Bean 24/7)',
      slug: 'disney-channel',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2022_Disney_Channel_logo.svg/512px-2022_Disney_Channel_logo.svg.png',
      streamUrl: 'https://amg00627-amg00627c23-samsung-au-4110.playouts.now.amagi.tv/playlist.m3u8',
      category: 'Kids',
      groupTitle: 'Kids',
    },
    {
      name: 'LEGO Kids TV',
      slug: 'lego-kids',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Lego_logo.svg/512px-Lego_logo.svg.png',
      streamUrl: 'https://jmp2.uk/plu-60fb01a24795a6000762fe83.m3u8',
      category: 'Kids',
      groupTitle: 'Kids',
    },
    {
      name: 'PBS Kids USA',
      slug: 'pbs-kids',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/PBS_Kids_logo_2022.svg/512px-PBS_Kids_logo_2022.svg.png',
      streamUrl: 'https://livestream.pbskids.org/out/v1/14507d931bbe48a69287e4850e53443c/est.m3u8',
      category: 'Kids',
      groupTitle: 'Kids',
    },
    {
      name: 'Red Bull Sports HD',
      slug: 'red-bull-sports',
      logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e4/Red_Bull_TV_logo.svg/512px-Red_Bull_TV_logo.svg.png',
      streamUrl: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master_928.m3u8',
      category: 'Sports',
      groupTitle: 'Sports',
    },
    {
      name: 'Edge Sport TV',
      slug: 'edge-sport',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Symbol_sport_blue.svg/512px-Symbol_sport_blue.svg.png',
      streamUrl: 'https://edgesport-edge.amagi.tv/playlist.m3u8',
      category: 'Sports',
      groupTitle: 'Sports',
    }
  ];

  constructor(
    @InjectRepository(TvChannel)
    private readonly tvChannelRepository: Repository<TvChannel>,
    @InjectRepository(TvFavorite)
    private readonly tvFavoriteRepository: Repository<TvFavorite>,
    @InjectRepository(TvHistory)
    private readonly tvHistoryRepository: Repository<TvHistory>,
  ) {}

  // Auto seed on boot
  async onApplicationBootstrap() {
    this.logger.log('[TvService] Updating TV channels in database to active high-availability streams...');
    try {
      // Clear old broken default channels
      await this.tvChannelRepository.delete({ isCustom: false });

      // Re-seed updated ones
      const entities = this.DEFAULT_CHANNELS.map(c => this.tvChannelRepository.create({
        ...c,
        isCustom: false,
        isActive: true
      }));
      await this.tvChannelRepository.save(entities);
      this.logger.log(`[TvService] Successfully updated & seeded ${entities.length} active premium TV channels.`);
    } catch (err) {
      this.logger.error(`[TvService] Error during auto-seeding: ${err.message}`);
    }
  }

  // 1. Get TV Channels list with query & category filter
  async getChannels(category?: string, keyword?: string) {
    this.logger.log(`[TvService] Fetching channels: category="${category || 'all'}", keyword="${keyword || ''}"`);
    try {
      const queryBuilder = this.tvChannelRepository.createQueryBuilder('channel');
      queryBuilder.where('channel.isActive = :isActive', { isActive: true });

      if (category && category.toLowerCase() !== 'all') {
        queryBuilder.andWhere('LOWER(channel.category) = LOWER(:category)', { category });
      }

      if (keyword && keyword.trim()) {
        queryBuilder.andWhere('LOWER(channel.name) LIKE LOWER(:keyword)', { keyword: `%${keyword.trim()}%` });
      }

      queryBuilder.orderBy('channel.category', 'ASC').addOrderBy('channel.id', 'ASC');

      const items = await queryBuilder.getMany();
      return {
        status: 200,
        message: 'Get TV channels successfully',
        data: items,
      };
    } catch (err) {
      this.logger.error(`[TvService] Error getting channels: ${err.message}`);
      return {
        status: 500,
        message: `Failed to retrieve TV channels: ${err.message}`,
        data: [],
      };
    }
  }

  // 2. Get list of unique TV Categories
  async getCategories() {
    this.logger.log('[TvService] Retrieving TV categories');
    try {
      const categories = await this.tvChannelRepository
        .createQueryBuilder('channel')
        .select('channel.category', 'category')
        .where('channel.isActive = :isActive', { isActive: true })
        .distinct(true)
        .orderBy('channel.category', 'ASC')
        .getRawMany();

      const list = categories.map(c => c.category).filter(Boolean);
      
      // Ensure 'All' or general values are well presented
      if (!list.includes('VTV')) list.unshift('VTV');

      return {
        status: 200,
        message: 'Get TV categories successfully',
        data: Array.from(new Set(['All', ...list])),
      };
    } catch (err) {
      this.logger.error(`[TvService] Error getting categories: ${err.message}`);
      return {
        status: 500,
        message: `Failed to retrieve TV categories: ${err.message}`,
        data: ['All'],
      };
    }
  }

  // 3. Get specific TV Channel details
  async getChannelBySlug(slug: string, userId?: number) {
    this.logger.log(`[TvService] Fetching channel: slug="${slug}"`);
    try {
      const channel = await this.tvChannelRepository.findOne({
        where: { slug, isActive: true },
      });

      if (!channel) {
        return {
          status: 404,
          message: `TV channel with slug "${slug}" not found`,
        };
      }

      // Check if favorited
      let isFavorited = false;
      if (userId) {
        const favorite = await this.tvFavoriteRepository.findOne({
          where: { userId, channelId: channel.id },
        });
        isFavorited = !!favorite;
      }

      // Generate realistic EPG schedule for today
      const epg = this.generateMockEpg(channel.name);

      return {
        status: 200,
        message: 'Get TV channel details successfully',
        data: {
          ...channel,
          isFavorited,
          epg,
        },
      };
    } catch (err) {
      this.logger.error(`[TvService] Error getting channel detail: ${err.message}`);
      return {
        status: 500,
        message: `Failed to retrieve TV channel detail: ${err.message}`,
      };
    }
  }

  // 4. Toggle Favorite Status
  async toggleFavorite(userId: number, dto: AddTvFavoriteDto) {
    this.logger.log(`[TvService] Toggling favorite for channelId: ${dto.channelId} for user: ${userId}`);
    try {
      const channel = await this.tvChannelRepository.findOne({
        where: { id: dto.channelId, isActive: true },
      });

      if (!channel) {
        return {
          status: 404,
          message: 'TV Channel not found or inactive',
        };
      }

      const existing = await this.tvFavoriteRepository.findOne({
        where: { userId, channelId: dto.channelId },
      });

      if (existing) {
        await this.tvFavoriteRepository.remove(existing);
        return {
          status: 200,
          message: 'Removed from TV favorites list',
          isFavorited: false,
        };
      } else {
        const favorite = this.tvFavoriteRepository.create({
          userId,
          channelId: dto.channelId,
        });
        await this.tvFavoriteRepository.save(favorite);
        return {
          status: 200,
          message: 'Added to TV favorites list',
          isFavorited: true,
        };
      }
    } catch (err) {
      this.logger.error(`[TvService] Error toggling favorite: ${err.message}`);
      return {
        status: 500,
        message: `Failed to toggle favorite: ${err.message}`,
      };
    }
  }

  // 5. List Favorites
  async listFavorites(userId: number) {
    this.logger.log(`[TvService] Listing TV favorites for user: ${userId}`);
    try {
      const favorites = await this.tvFavoriteRepository.find({
        where: { userId },
        relations: ['channel'],
        order: { createdAt: 'DESC' },
      });

      // Map relation to raw list
      const channels = favorites
        .map(f => f.channel)
        .filter(c => c && c.isActive);

      return {
        status: 200,
        message: 'Get TV favorites successfully',
        data: channels,
      };
    } catch (err) {
      this.logger.error(`[TvService] Error listing favorites: ${err.message}`);
      return {
        status: 500,
        message: `Failed to retrieve TV favorites: ${err.message}`,
        data: [],
      };
    }
  }

  // 6. Track Watch History
  async addWatchHistory(userId: number, dto: AddTvHistoryDto) {
    this.logger.log(`[TvService] Logging TV watch history for channelId: ${dto.channelId} for user: ${userId}`);
    try {
      const channel = await this.tvChannelRepository.findOne({
        where: { id: dto.channelId, isActive: true },
      });

      if (!channel) {
        return {
          status: 404,
          message: 'TV Channel not found or inactive',
        };
      }

      // Check if history already exists for this channel and user
      let history = await this.tvHistoryRepository.findOne({
        where: { userId, channelId: dto.channelId },
      });

      if (history) {
        // Touch / Update updatedAt field
        history.updatedAt = new Date();
      } else {
        history = this.tvHistoryRepository.create({
          userId,
          channelId: dto.channelId,
        });
      }

      const saved = await this.tvHistoryRepository.save(history);
      return {
        status: 200,
        message: 'TV watch history updated successfully',
        data: saved,
      };
    } catch (err) {
      this.logger.error(`[TvService] Error logging history: ${err.message}`);
      return {
        status: 500,
        message: `Failed to log TV history: ${err.message}`,
      };
    }
  }

  // 7. Get Watch History
  async listWatchHistory(userId: number) {
    this.logger.log(`[TvService] Listing TV watch history for user: ${userId}`);
    try {
      const history = await this.tvHistoryRepository.find({
        where: { userId },
        relations: ['channel'],
        order: { updatedAt: 'DESC' },
      });

      const channels = history
        .map(h => h.channel)
        .filter(c => c && c.isActive);

      return {
        status: 200,
        message: 'Get TV watch history successfully',
        data: channels,
      };
    } catch (err) {
      this.logger.error(`[TvService] Error listing history: ${err.message}`);
      return {
        status: 500,
        message: `Failed to retrieve TV watch history: ${err.message}`,
        data: [],
      };
    }
  }

  // Clear History
  async clearWatchHistory(userId: number) {
    this.logger.log(`[TvService] Clearing TV watch history for user: ${userId}`);
    try {
      await this.tvHistoryRepository.delete({ userId });
      return {
        status: 200,
        message: 'TV watch history cleared successfully',
      };
    } catch (err) {
      this.logger.error(`[TvService] Error clearing history: ${err.message}`);
      return {
        status: 500,
        message: `Failed to clear TV watch history: ${err.message}`,
      };
    }
  }

  // 8. Import/Sync Channels from external M3U link (Full dynamic IPTV support!)
  async syncFromM3u(m3uUrl: string, cleanExisting: boolean = false) {
    this.logger.log(`[TvService] Syncing IPTV channels from M3U: url="${m3uUrl}", cleanExisting=${cleanExisting}`);
    try {
      const response = await fetch(m3uUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch M3U playlist from "${m3uUrl}": Status ${response.status}`);
      }
      const m3uContent = await response.text();

      // Simple, highly robust M3U Playlist Parser
      const lines = m3uContent.split(/\r?\n/);
      const parsedChannels: Partial<TvChannel>[] = [];
      let currentMetadata: { name?: string, logo?: string, category?: string, groupTitle?: string } | null = null;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.startsWith('#EXTINF:')) {
          // Parse EXTINF metadata
          // Format e.g.: #EXTINF:-1 tvg-id="VTV1.vn" tvg-logo="https://..." group-title="General",VTV1 HD
          const logoMatch = line.match(/tvg-logo="([^"]*)"/);
          const groupMatch = line.match(/group-title="([^"]*)"/);
          
          // Name is everything after the last comma
          const commaIndex = line.lastIndexOf(',');
          let name = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : 'Unknown Channel';
          
          // Clean name (e.g. remove geo-block comments or status tags)
          name = name.replace(/\s*\[Geo-blocked\]/gi, '')
                     .replace(/\s*\[Not 24\/7\]/gi, '')
                     .replace(/\s*\(\d+p\)/gi, '')
                     .trim();

          const logo = logoMatch ? logoMatch[1] : '';
          const groupTitle = groupMatch ? groupMatch[1] : 'IPTV';
          
          // Classify category based on name/group
          let category = 'Local';
          if (name.toUpperCase().includes('VTV')) category = 'VTV';
          else if (name.toUpperCase().includes('HTV')) category = 'HTV';
          else if (name.toUpperCase().includes('SCTV')) category = 'SCTV';
          else if (name.toUpperCase().includes('VTC')) category = 'VTC';
          else if (groupTitle.toLowerCase().includes('sport') || name.toLowerCase().includes('thể thao')) category = 'Sports';
          else if (groupTitle.toLowerCase().includes('movie') || name.toLowerCase().includes('phim')) category = 'Movies';
          else if (groupTitle.toLowerCase().includes('kid') || name.toLowerCase().includes('thiếu nhi')) category = 'Kids';
          else if (groupTitle.toLowerCase().includes('music') || name.toLowerCase().includes('ca nhạc')) category = 'SCTV';

          currentMetadata = { name, logo, category, groupTitle };
        } else if (line.startsWith('http://') || line.startsWith('https://')) {
          // It's a stream URL
          if (currentMetadata && currentMetadata.name) {
            // Generate distinct unique slug
            const baseSlug = currentMetadata.name.toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');
            
            const slug = parsedChannels.some(c => c.slug === baseSlug)
              ? `${baseSlug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`
              : baseSlug;

            parsedChannels.push({
              name: currentMetadata.name,
              slug,
              logo: currentMetadata.logo,
              streamUrl: line,
              category: currentMetadata.category,
              groupTitle: currentMetadata.groupTitle,
              isCustom: true,
              isActive: true,
            });
            currentMetadata = null;
          }
        }
      }

      if (parsedChannels.length === 0) {
        return {
          status: 400,
          message: 'No channels found or failed to parse the M3U content.',
          count: 0,
        };
      }

      // Perform DB updates
      if (cleanExisting) {
        // Clear all previous dynamic custom channels
        await this.tvChannelRepository.delete({ isCustom: true });
      }

      let successCount = 0;
      for (const chan of parsedChannels) {
        try {
          // Double check if slug already exists to prevent duplicate key errors
          const existing = await this.tvChannelRepository.findOne({
            where: { slug: chan.slug },
          });

          if (existing) {
            // Update stream URL & logo if it matches
            if (chan.streamUrl) {
              existing.streamUrl = chan.streamUrl;
            }
            existing.logo = chan.logo || existing.logo;
            existing.category = chan.category || existing.category;
            existing.groupTitle = chan.groupTitle || existing.groupTitle;
            await this.tvChannelRepository.save(existing);
          } else {
            const newChan = this.tvChannelRepository.create(chan);
            await this.tvChannelRepository.save(newChan);
          }
          successCount++;
        } catch (err) {
          // Silently log and skip unique constraint issues for multiple inserts
          this.logger.debug(`Skipping import of "${chan.name}" due to: ${err.message}`);
        }
      }

      return {
        status: 200,
        message: `Successfully synchronized TV Channels from M3U playlist.`,
        data: {
          totalParsed: parsedChannels.length,
          successfullyImported: successCount,
        },
      };
    } catch (err) {
      this.logger.error(`[TvService] Error syncing from M3U: ${err.message}`);
      return {
        status: 500,
        message: `Sync failed: ${err.message}`,
      };
    }
  }

  // 9. Generate realistic premium mock EPG Schedule
  private generateMockEpg(channelName: string) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const programs: any[] = [];

    // Define schedule templates for different channel categories
    let template = [
      { time: '00:00', duration: 120, title: 'Phim Truyện Đêm Khuya', desc: 'Tuyển tập phim truyện đặc sắc phát sóng vào ban đêm.' },
      { time: '02:00', duration: 180, title: 'Hòa Nhịp Ca Nhạc', desc: 'Thưởng thức các ca khúc trữ tình, quê hương chọn lọc.' },
      { time: '05:00', duration: 60, title: 'Thể Dục Buổi Sáng', desc: 'Cùng khởi động ngày mới năng động với các bài tập bổ ích.' },
      { time: '06:00', duration: 120, title: 'Chào Buổi Sáng', desc: 'Chương trình điểm tin sáng, thông tin thời tiết, thị trường và giao thông.' },
      { time: '08:00', duration: 60, title: 'Khám Phá Thế Giới', desc: 'Thước phim tài liệu khoa học chân thực về thiên nhiên kỳ thú.' },
      { time: '09:00', duration: 60, title: 'Bản Tin Thời Sự Sáng', desc: 'Cập nhật tin tức trong nước và quốc tế nóng hổi.' },
      { time: '10:00', duration: 120, title: 'Phim Truyện Sáng', desc: 'Loạt phim truyền hình gia đình hấp dẫn.' },
      { time: '12:00', duration: 30, title: 'Bản Tin Trưa', desc: 'Tin tức tổng hợp giữa ngày từ trường quay.' },
      { time: '12:30', duration: 90, title: 'Nhịp Sống Trưa', desc: 'Gặp gỡ nghệ sĩ nổi tiếng và khám phá văn hóa ẩm thực.' },
      { time: '14:00', duration: 120, title: 'Phim Chiều Chọn Lọc', desc: 'Phim truyền hình lãng mạn châu Á ăn khách.' },
      { time: '16:00', duration: 60, title: 'Ký Sự Đi Đường', desc: 'Khám phá những danh lam thắng cảnh khắp dải đất hình chữ S.' },
      { time: '17:00', duration: 60, title: 'Bản Tin Chiều: Việt Nam Hôm Nay', desc: 'Tổng kết hoạt động dân sinh, xã hội trong ngày.' },
      { time: '18:00', duration: 60, title: 'Hành Trình Tri Thức', desc: 'Cuộc thi đố vui kiến thức dành cho học sinh, sinh viên.' },
      { time: '19:00', duration: 45, title: 'BẢN TIN THỜI SỰ 19H', desc: 'Chương trình Thời sự quốc gia đặc biệt quan trọng.' },
      { time: '19:45', duration: 15, title: 'Dự Báo Thời Tiết', desc: 'Thông tin thời tiết vùng miền chi tiết.' },
      { time: '20:00', duration: 90, title: 'Phim Truyện Giờ Vàng', desc: 'Bộ phim truyền hình đình đám nhất đang thu hút triệu khán giả.' },
      { time: '21:30', duration: 45, title: 'Vấn Đề Hôm Nay', desc: 'Bình luận chuyên sâu về các vấn đề nóng trong ngày.' },
      { time: '22:15', duration: 45, title: 'Kịch Tương Tác', desc: 'Sân khấu kịch nghệ thuật đầy tính giáo dục.' },
      { time: '23:00', duration: 60, title: 'Bản Tin Cuối Ngày', desc: 'Tin nhanh và tóm tắt sự kiện trước giờ đi ngủ.' }
    ];

    const upName = channelName.toUpperCase();
    
    // Customize template based on channel type
    if (upName.includes('THIẾU NHI') || upName.includes('SCTV3') || upName.includes('KIDS')) {
      template = [
        { time: '00:00', duration: 120, title: 'Giấc Mơ Của Bé', desc: 'Những giai điệu ru con ngọt ngào trước giờ ngủ.' },
        { time: '02:00', duration: 240, title: 'Nhạc Thiếu Nhi Ngủ Ngon', desc: 'Những âm thanh du dương thư giãn trí óc trẻ thơ.' },
        { time: '06:00', duration: 60, title: 'Bình Minh Bé Con', desc: 'Ca nhạc hoạt hình sôi động chào ngày mới.' },
        { time: '07:00', duration: 60, title: 'Doraemon - Chú Mèo Máy', desc: 'Khám phá những bảo bối thần kỳ cùng Nobita và các bạn.' },
        { time: '08:00', duration: 60, title: 'Tom & Jerry Show', desc: 'Những cuộc rượt đuổi không hồi kết giữa chú mèo Tom và chuột Jerry.' },
        { time: '09:00', duration: 120, title: 'Học Tiếng Anh Qua Bài Hát', desc: 'Vừa học vừa chơi cùng các nhân vật hoạt hình dễ thương.' },
        { time: '11:00', duration: 60, title: 'Thám Tử Lừng Danh Conan', desc: 'Những vụ án hóc búa được hóa giải bởi thám tử học sinh Conan.' },
        { time: '12:00', duration: 60, title: 'Shin - Cậu Bé Bút Chì', desc: 'Cuộc sống hài hước vui nhộn quanh cậu bé Shin tinh nghịch.' },
        { time: '13:00', duration: 120, title: 'Truyền Thuyết Các Vị Thần', desc: 'Hành trình phiêu lưu thế giới cổ tích kỳ ảo.' },
        { time: '15:00', duration: 60, title: 'Oggy Và Những Chú Gián', desc: 'Cuộc chiến hài hước giữa chú mèo Oggy hiền lành và ba con gián tinh quái.' },
        { time: '16:00', duration: 120, title: 'Chương Trình Thủ Công Khéo Tay', desc: 'Dạy bé làm đồ chơi xếp giấy Origami cực xinh.' },
        { time: '18:00', duration: 60, title: 'Doraemon - Tập Đặc Biệt', desc: 'Tập phim dài với những hành trình thám hiểm phiêu lưu kỳ thú.' },
        { time: '19:00', duration: 60, title: 'Phim Hoạt Hình Chiếu Rạp Giờ Vàng', desc: 'Siêu phẩm phim hoạt hình 3D đỉnh cao đầy cảm động.' },
        { time: '21:00', duration: 60, title: 'Kể Chuyện Bé Nghe Trước Giờ Đi Ngủ', desc: 'Các câu chuyện ngụ ngôn nhân văn dạy bé làm người tốt.' },
        { time: '22:00', duration: 120, title: 'Bản Nhạc Ru Con', desc: 'Nhạc không lời êm dịu đưa bé vào giấc ngủ sâu.' }
      ];
    } else if (upName.includes('THỂ THAO') || upName.includes('SPORT') || upName.includes('VTC3')) {
      template = [
        { time: '00:00', duration: 120, title: 'Nhìn Lại Ngoại Hạng Anh', desc: 'Tổng hợp diễn biến, bàn thắng đẹp vòng đấu vừa qua.' },
        { time: '02:00', duration: 180, title: 'Phát Lại Trận Đấu Kinh Điển', desc: 'Tái hiện trận thư hùng kịch tính đỉnh cao của bóng đá thế giới.' },
        { time: '05:00', duration: 60, title: 'Yoga Buổi Sáng', desc: 'Bài tập duy trì độ dẻo dai và năng lượng tích cực.' },
        { time: '06:00', duration: 60, title: 'Bản Tin Thể Thao 24/7 Sáng', desc: 'Nóng cùng nhịp đập thể thao quốc tế và Việt Nam.' },
        { time: '07:00', duration: 120, title: 'Đua Xe Công Thức 1 - F1', desc: 'Tóm tắt chặng đua nghẹt thở từ những siêu xế hộp.' },
        { time: '09:00', duration: 180, title: 'Giải Quần Vợt Grand Slam', desc: 'Tường thuật các pha giao bóng uy lực từ giải quần vợt danh giá.' },
        { time: '12:00', duration: 60, title: 'Bản Tin Thể Thao Trưa', desc: 'Điểm tin thị trường chuyển nhượng và phong độ cầu thủ.' },
        { time: '13:00', duration: 120, title: 'Thể Thao Mạo Hiểm', desc: 'Những pha lướt sóng khổng lồ và nhảy dù bay lượn ngút ngàn.' },
        { time: '15:00', duration: 120, title: 'Tạp Chí Bóng Đá La Liga', desc: 'Phóng sự đặc sắc về các câu lạc bộ bóng đá hàng đầu Tây Ban Nha.' },
        { time: '17:00', duration: 60, title: 'Tin Nhanh Esport Thế Giới', desc: 'Điểm tin các giải đấu eSport chuyên nghiệp hoành tráng.' },
        { time: '18:00', duration: 60, title: 'Bản Tin Trước Trận Đấu Giờ Vàng', desc: 'Phân tích chuyên sâu chiến thuật và nhận định cùng chuyên gia.' },
        { time: '19:00', duration: 150, title: 'TRỰC TIẾP: GIẢI NGOẠI HẠNG ANH', desc: 'Tường thuật trực tiếp trận đấu nảy lửa thuộc khuôn khổ Ngoại Hạng Anh.' },
        { time: '21:30', duration: 90, title: 'Bình Luận Sau Trận Đấu', desc: 'Mổ xẻ các tình huống tranh cãi và phỏng vấn trực tiếp ban huấn luyện.' },
        { time: '23:00', duration: 60, title: 'Bản Tin Thể Thao Cuối Ngày', desc: 'Toàn cảnh kết quả thi đấu trong và ngoài nước hôm nay.' }
      ];
    } else if (upName.includes('PHIM') || upName.includes('SCTV16') || upName.includes('SCTV14') || upName.includes('TODAYTV')) {
      template = [
        { time: '00:00', duration: 120, title: 'Phim Kinh Dị Đêm Khuya', desc: 'Những thước phim giật gân, ly kỳ thách thức lòng can đảm.' },
        { time: '02:00', duration: 180, title: 'Phim Điện Ảnh Chọn Lọc', desc: 'Kiệt tác nghệ thuật đạt nhiều giải thưởng danh giá.' },
        { time: '05:00', duration: 60, title: 'Hậu Trường Phim Ảnh', desc: 'Góc nhìn hậu trường thực tế và những chia sẻ của dàn diễn viên.' },
        { time: '06:00', duration: 120, title: 'Phim Truyện Sáng Ban Mai', desc: 'Phim gia đình nhẹ nhàng tình cảm.' },
        { time: '08:00', duration: 120, title: 'Phim Truyền Hình Kiếm Hiệp', desc: 'Những pha võ thuật mãn nhãn và cốt truyện nghĩa hiệp hấp dẫn.' },
        { time: '10:00', duration: 120, title: 'Phim Cổ Trang Dã Sử', desc: 'Hành trình tranh đoạt quyền lực chốn cung đình xưa.' },
        { time: '12:00', duration: 120, title: 'Phim Truyện Trưa Đặc Sắc', desc: 'Phim truyền hình ngôn tình hiện đại.' },
        { time: '14:00', duration: 120, title: 'Phim Hành Động Kịch Tính', desc: 'Gay cấn cùng các pha rượt đuổi tốc độ cao nghẹt thở.' },
        { time: '16:00', duration: 120, title: 'Phim Việt Nam Độc Quyền', desc: 'Tác phẩm phim truyền hình mang đậm văn hóa đời sống Việt.' },
        { time: '18:00', duration: 60, title: 'Giới Thiệu Trailer Phim Mới', desc: 'Điểm mặt những bom tấn điện ảnh sắp ra lò.' },
        { time: '19:00', duration: 120, title: 'Phim Truyền Hình Giờ Vàng Bom Tấn', desc: 'Bộ phim tâm lý xã hội đang dẫn đầu bảng xếp hạng rating tỷ suất người xem.' },
        { time: '21:00', duration: 120, title: 'Phim Chiếu Rạp Cuối Tuần', desc: 'Bom tấn Hollywood hành động khoa học viễn tưởng tuyệt đỉnh.' },
        { time: '23:00', duration: 60, title: 'Phim Ngắn Hài Hước', desc: 'Những mẩu chuyện vui nhộn đem lại tiếng cười sảng khoái trước khi ngủ.' }
      ];
    }

    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    const currentTimeStrStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    let activeIndex = -1;

    // Calculate actual program ranges for today
    for (let i = 0; i < template.length; i++) {
      const currentItem = template[i];
      const nextItem = template[i + 1];

      const [cHour, cMin] = currentItem.time.split(':').map(Number);
      const programStart = new Date(startOfDay.getTime());
      programStart.setHours(cHour, cMin, 0);

      const programEnd = new Date(programStart.getTime() + currentItem.duration * 60 * 1000);

      // Format time string for next program endpoint display
      const endTimeStr = `${String(programEnd.getHours()).padStart(2, '0')}:${String(programEnd.getMinutes()).padStart(2, '0')}`;

      // Check if current date time falls within this program
      const isCurrentActive = today >= programStart && today < programEnd;

      programs.push({
        time: currentItem.time,
        endTime: endTimeStr,
        title: currentItem.title,
        description: currentItem.desc,
        isActive: isCurrentActive,
      });

      if (isCurrentActive) {
        activeIndex = i;
      }
    }

    // Fallback in case no program marked active (e.g. boundary conditions)
    if (activeIndex === -1 && programs.length > 0) {
      // Find the closest program before the current time
      for (let i = programs.length - 1; i >= 0; i--) {
        const [pHour, pMin] = programs[i].time.split(':').map(Number);
        if (currentHour > pHour || (currentHour === pHour && currentMinute >= pMin)) {
          programs[i].isActive = true;
          break;
        }
      }
      // If still nothing active, mark the first one
      if (!programs.some(p => p.isActive)) {
        programs[0].isActive = true;
      }
    }

    return programs;
  }
}
