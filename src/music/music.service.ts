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
      // Scrape hot Vietnamese and Billboard global hits in parallel
      const [vpopResults, globalResults] = await Promise.all([
        this.scrapeYouTubeSearch('nhạc trẻ mới nhất hot nhất vpop'),
        this.scrapeYouTubeSearch('billboard hot 100 pop hits')
      ]);
      
      const tracks: TrackDto[] = [];
      
      // Dynamic mapping & mock-locking some tracks to demonstrate VIP/restricted UI
      vpopResults.slice(0, 15).forEach((t, i) => {
        t.genre = 'V-Pop';
        t.id = `vpop-${i}`;
        if (i === 4 || i === 9) {
          t.isLocked = true;
          t.name = `${t.name} (VIP Exclusive)`;
          t.previewUrl = ''; // Lock playback
        }
        tracks.push(t);
      });
      
      globalResults.slice(0, 15).forEach((t, i) => {
        t.genre = 'Pop';
        t.id = `pop-${i}`;
        if (i === 2) {
          t.isLocked = true;
          t.name = `${t.name} (Restricted License)`;
          t.previewUrl = ''; // Lock playback
        }
        tracks.push(t);
      });
      
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
      // If user selected a genre category sidebar link
      if (cleanKeyword === 'v-pop') {
        const results = await this.scrapeYouTubeSearch('nhạc trẻ hot nhất hiện nay vpop');
        return results.map((t, i) => {
          t.genre = 'V-Pop';
          if (i === 4 || i === 9) { t.isLocked = true; t.name += ' (VIP Exclusive)'; t.previewUrl = ''; }
          return t;
        });
      }
      if (cleanKeyword === 'pop') {
        const results = await this.scrapeYouTubeSearch('pop music hits billboard taylor swift');
        return results.map((t, i) => {
          t.genre = 'Pop';
          if (i === 2) { t.isLocked = true; t.name += ' (Restricted)'; t.previewUrl = ''; }
          return t;
        });
      }
      if (cleanKeyword === 'edm') {
        const results = await this.scrapeYouTubeSearch('best edm music festival hits electro');
        return results.map((t, i) => {
          t.genre = 'EDM';
          if (i === 3) { t.isLocked = true; t.name += ' (VIP Only)'; t.previewUrl = ''; }
          return t;
        });
      }
      if (cleanKeyword === 'rock') {
        const results = await this.scrapeYouTubeSearch('rock classics hits bands live');
        return results.map((t, i) => {
          t.genre = 'Rock';
          if (i === 5) { t.isLocked = true; t.name += ' (VIP Only)'; t.previewUrl = ''; }
          return t;
        });
      }
      if (cleanKeyword === 'acoustic') {
        const results = await this.scrapeYouTubeSearch('acoustic pop cover love songs');
        return results.map((t, i) => {
          t.genre = 'Acoustic';
          if (i === 1) { t.isLocked = true; t.name += ' (Restricted)'; t.previewUrl = ''; }
          return t;
        });
      }

      // Regular search query
      const results = await this.scrapeYouTubeSearch(cleanKeyword);
      if (results && results.length > 0) {
        return results;
      }
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
      
      const html = await response.text();
      
      // Look for ytInitialData script block
      const startMarker = 'var ytInitialData = ';
      const endMarker = ';</script>';
      let startIndex = html.indexOf(startMarker);
      
      if (startIndex === -1) {
        const alternativeStart = 'window["ytInitialData"] = ';
        startIndex = html.indexOf(alternativeStart);
        if (startIndex === -1) return [];
        startIndex += alternativeStart.length;
      } else {
        startIndex += startMarker.length;
      }
      
      const endIndex = html.indexOf(endMarker, startIndex);
      if (endIndex === -1) return [];
      
      const jsonStr = html.substring(startIndex, endIndex);
      const data = JSON.parse(jsonStr);
      
      const results: TrackDto[] = [];
      const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
      
      if (!contents || !Array.isArray(contents)) return [];
      
      for (const item of contents) {
        const video = item.videoRenderer;
        if (video && video.videoId) {
          const videoId = video.videoId;
          
          // Format YouTube title cleanups (remove MV, Official Audio, official, Video, etc.)
          let title = video.title?.runs?.[0]?.text || 'YouTube Song';
          title = title.replace(/\[.*?\]|\(.*?\)/g, '').trim(); // Remove brackets like [MV], (Official Audio)
          
          let artist = video.ownerText?.runs?.[0]?.text || 'Unknown Artist';
          artist = artist.replace(/ - Topic|VEVO/gi, '').trim(); // Clean channel names like "TaylorSwiftVEVO" or "SonTung-Topic"

          const coverUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
          const durationText = video.lengthText?.simpleText || '03:30';
          
          const parts = durationText.split(':').map(Number);
          let durationMs = 210000;
          if (parts.length === 2) {
            durationMs = (parts[0] * 60 + parts[1]) * 1000;
          } else if (parts.length === 3) {
            durationMs = (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000;
          }
          
          // Split title to extract artist and track name if formatted like "Artist - Name"
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
