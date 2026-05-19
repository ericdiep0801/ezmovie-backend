import { Injectable, Logger } from '@nestjs/common';

export interface TrackDto {
  id: string;
  name: string;
  artist: string;
  album: string;
  coverUrl: string;
  previewUrl: string; // YouTube Video ID
  durationMs: number;
  embedUrl: string;
  popularity: number;
  genre: string;
  isLocked?: boolean; // If true, song is unplayable, unavailable, or hidden
}

@Injectable()
export class MusicService {
  private readonly logger = new Logger(MusicService.name);

  /**
   * Dynamically fetch trending V-Pop & Global Hits in real-time from YouTube (no hardcoding!)
   */
  async getTrendingTracks(): Promise<TrackDto[]> {
    this.logger.log('Dynamically fetching trending music from YouTube (no hardcoding!).');
    
    try {
      const queries = [
        'nhạc trẻ mới nhất hot nhất vpop',
        'vpop viral hits tik tok hot',
        'billboard hot 100 pop hits',
        'lofi chill music playlist'
      ];
      
      const seen = new Set<string>();
      const tracks: TrackDto[] = [];
      let index = 0;
      
      // Fetch sequentially with early exit to preserve RAM under 512MB limit
      for (const query of queries) {
        const results = await this.scrapeYouTubeSearch(query);
        for (const t of results) {
          if (!seen.has(t.previewUrl)) {
            seen.add(t.previewUrl);
            
            // Let's dynamically tag genre
            if (t.genre === 'YouTube') {
              t.genre = index % 2 === 0 ? 'V-Pop' : 'Pop';
            }
            t.id = `trending-${index}`;
            if (index === 4 || index === 9 || index === 15 || index === 22) {
              t.isLocked = true;
              t.name = `${t.name} (VIP Exclusive)`;
              t.previewUrl = ''; // Lock playback
            }
            tracks.push(t);
            index++;
          }
        }
        if (tracks.length >= 100) break; // Stop early once we reach the 100+ song limit!
      }
      
      if (tracks.length > 0) {
        return tracks;
      }
    } catch (e) {
      this.logger.error('Failed to scrape trending live tracks', e);
    }
    
    // Absolute fallback in case of scraping failures
    return [
      {
        id: 'vpop-fallback',
        name: 'Chúng Ta Của Tương Lai',
        artist: 'Sơn Tùng M-TP',
        album: 'Trending V-Pop',
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80',
        previewUrl: 'tcS84W-p1q0',
        durationMs: 251000,
        embedUrl: 'https://www.youtube.com/embed/tcS84W-p1q0',
        popularity: 98,
        genre: 'V-Pop'
      }
    ];
  }

  /**
   * Dynamically search for tracks in real-time or query dynamic genre lists on YouTube (unlimited catalog!)
   */
  async searchTracks(keyword: string): Promise<TrackDto[]> {
    if (!keyword || !keyword.trim()) {
      return this.getTrendingTracks();
    }

    const cleanKeyword = keyword.trim().toLowerCase();
    this.logger.log(`Searching global dynamic catalog for: "${cleanKeyword}"`);

    try {
      let queries: string[] = [];
      let defaultGenre = 'YouTube';

      if (cleanKeyword === 'v-pop') {
        queries = [
          'nhạc trẻ hot nhất hiện nay vpop',
          'vpop hot hits acoustic chill',
          'vpop remix tik tok hot',
          'nhạc trẻ mới phát hành'
        ];
        defaultGenre = 'V-Pop';
      } else if (cleanKeyword === 'pop') {
        queries = [
          'pop music hits billboard taylor swift',
          'global top pop hits playlist',
          'pop billboard hot 100',
          'new pop releases english'
        ];
        defaultGenre = 'Pop';
      } else if (cleanKeyword === 'edm') {
        queries = [
          'best edm music festival hits electro',
          'ultra edm dance party hits',
          'gaming edm ncs hits',
          'slap house edm viral'
        ];
        defaultGenre = 'EDM';
      } else if (cleanKeyword === 'rock') {
        queries = [
          'rock classics hits bands live',
          'alternative rock grunge hits',
          'heavy metal rock legends',
          'acoustic rock covers playlist'
        ];
        defaultGenre = 'Rock';
      } else if (cleanKeyword === 'acoustic') {
        queries = [
          'acoustic pop cover love songs',
          'acoustic guitar chill covers',
          'indie folk acoustic playlist',
          'vpop acoustic cover chill'
        ];
        defaultGenre = 'Acoustic';
      } else {
        // Regular search query with variations
        queries = [
          cleanKeyword,
          cleanKeyword + ' official music video',
          cleanKeyword + ' lyric audio',
          cleanKeyword + ' live acoustic remix'
        ];
      }

      const seen = new Set<string>();
      const results: TrackDto[] = [];
      let index = 0;

      // Sequential batch fetching with early exit to keep memory minimal
      for (const query of queries) {
        const batch = await this.scrapeYouTubeSearch(query);
        for (const t of batch) {
          if (!seen.has(t.previewUrl)) {
            seen.add(t.previewUrl);
            t.genre = defaultGenre !== 'YouTube' ? defaultGenre : t.genre;
            t.id = `${defaultGenre.toLowerCase()}-${index}`;
            
            // Apply beautiful premium mockup licenses
            if (defaultGenre === 'V-Pop' && (index === 4 || index === 9 || index === 15)) {
              t.isLocked = true;
              t.name += ' (VIP Exclusive)';
              t.previewUrl = '';
            } else if (defaultGenre === 'Pop' && (index === 2 || index === 12)) {
              t.isLocked = true;
              t.name += ' (Restricted)';
              t.previewUrl = '';
            } else if (defaultGenre === 'EDM' && (index === 3 || index === 14)) {
              t.isLocked = true;
              t.name += ' (VIP Only)';
              t.previewUrl = '';
            } else if (defaultGenre === 'Rock' && (index === 5 || index === 16)) {
              t.isLocked = true;
              t.name += ' (VIP Only)';
              t.previewUrl = '';
            } else if (defaultGenre === 'Acoustic' && (index === 1 || index === 11)) {
              t.isLocked = true;
              t.name += ' (Restricted)';
              t.previewUrl = '';
            }
            
            results.push(t);
            index++;
          }
        }
        if (results.length >= 100) break; // Early stop when >= 100 items gathered to protect container RAM!
      }

      return results;
    } catch (e) {
      this.logger.error('Live search scraper failed', e);
    }

    return [];
  }

  /**
   * Custom, high-speed, keyless YouTube search scraper
   */
  private async scrapeYouTubeSearch(query: string): Promise<TrackDto[]> {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' music video audio')}&sp=EgIQAQ%253D%253D`;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });
      
      let html: string | null = await response.text();
      
      // Look for ytInitialData script block
      const startMarker = 'var ytInitialData = ';
      const endMarker = ';</script>';
      let startIndex = html.indexOf(startMarker);
      
      if (startIndex === -1) {
        const alternativeStart = 'window["ytInitialData"] = ';
        startIndex = html.indexOf(alternativeStart);
        if (startIndex === -1) {
          html = null; // Instantly release memory block!
          return [];
        }
        startIndex += alternativeStart.length;
      } else {
        startIndex += startMarker.length;
      }
      
      const endIndex = html.indexOf(endMarker, startIndex);
      if (endIndex === -1) {
        html = null; // Instantly release memory block!
        return [];
      }
      
      const jsonStr = html.substring(startIndex, endIndex);
      html = null; // Clean up large HTML raw buffer from RAM immediately before JSON parsing!
      
      const data = JSON.parse(jsonStr);
      
      const results: TrackDto[] = [];
      const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
      
      if (!contents || !Array.isArray(contents)) {
        return [];
      }
      
      for (const item of contents) {
        const video = item.videoRenderer;
        if (video && video.videoId) {
          const videoId = video.videoId;
          
          // Format YouTube title cleanups
          let title = video.title?.runs?.[0]?.text || 'YouTube Song';
          title = title.replace(/\[.*?\]|\(.*?\)/g, '').trim(); // Remove brackets
          
          let artist = video.ownerText?.runs?.[0]?.text || 'Unknown Artist';
          artist = artist.replace(/ - Topic|VEVO/gi, '').trim(); // Clean channel names

          const coverUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
          const durationText = video.lengthText?.simpleText || '03:30';
          
          const parts = durationText.split(':').map(Number);
          let durationMs = 210000;
          if (parts.length === 2) {
            durationMs = (parts[0] * 60 + parts[1]) * 1000;
          } else if (parts.length === 3) {
            durationMs = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
          }
          
          // Split title to extract artist and track name
          let trackName = title;
          let trackArtist = artist;
          if (title.includes(' - ')) {
            const split = title.split(' - ');
            trackArtist = split[0].trim();
            trackName = split[1].trim();
          }

          results.push({
            id: `yt-${videoId}`,
            name: trackName,
            artist: trackArtist,
            album: video.viewCountText?.simpleText || 'YouTube Video',
            coverUrl: coverUrl,
            previewUrl: videoId,
            durationMs: durationMs,
            embedUrl: `https://www.youtube.com/embed/${videoId}`,
            popularity: 95,
            genre: 'YouTube'
          });
          
          if (results.length >= 35) break; // Return 35 items
        }
      }
      return results;
    } catch (error) {
      this.logger.error('Error scraping YouTube search', error);
      return [];
    }
  }
}
