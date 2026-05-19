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
  /**
   * Dynamically fetch trending V-Pop & Global Hits in real-time from YouTube (no hardcoding!)
   */
  async getTrendingTracks(): Promise<TrackDto[]> {
    this.logger.log('Dynamically fetching trending music from YouTube (no hardcoding!).');
    
    try {
      // Scrape hot Vietnamese and Billboard global hits in parallel
      const [vpopResults1, vpopResults2, globalResults1, globalResults2] = await Promise.all([
        this.scrapeYouTubeSearch('nhạc trẻ mới nhất hot nhất vpop'),
        this.scrapeYouTubeSearch('vpop viral hits tik tok hot'),
        this.scrapeYouTubeSearch('billboard hot 100 pop hits'),
        this.scrapeYouTubeSearch('lofi chill music playlist')
      ]);
      
      const combined = [...vpopResults1, ...vpopResults2, ...globalResults1, ...globalResults2];
      const seen = new Set<string>();
      const tracks: TrackDto[] = [];
      
      let index = 0;
      for (const t of combined) {
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
        const [r1, r2, r3, r4] = await Promise.all([
          this.scrapeYouTubeSearch('nhạc trẻ hot nhất hiện nay vpop'),
          this.scrapeYouTubeSearch('vpop hot hits acoustic chill'),
          this.scrapeYouTubeSearch('vpop remix tik tok hot'),
          this.scrapeYouTubeSearch('nhạc trẻ mới phát hành')
        ]);
        const combined = [...r1, ...r2, ...r3, ...r4];
        const seen = new Set<string>();
        const results: TrackDto[] = [];
        let index = 0;
        for (const t of combined) {
          if (!seen.has(t.previewUrl)) {
            seen.add(t.previewUrl);
            t.genre = 'V-Pop';
            t.id = `vpop-${index}`;
            if (index === 4 || index === 9 || index === 15) { t.isLocked = true; t.name += ' (VIP Exclusive)'; t.previewUrl = ''; }
            results.push(t);
            index++;
          }
        }
        return results;
      }
      if (cleanKeyword === 'pop') {
        const [r1, r2, r3, r4] = await Promise.all([
          this.scrapeYouTubeSearch('pop music hits billboard taylor swift'),
          this.scrapeYouTubeSearch('global top pop hits playlist'),
          this.scrapeYouTubeSearch('pop billboard hot 100'),
          this.scrapeYouTubeSearch('new pop releases english')
        ]);
        const combined = [...r1, ...r2, ...r3, ...r4];
        const seen = new Set<string>();
        const results: TrackDto[] = [];
        let index = 0;
        for (const t of combined) {
          if (!seen.has(t.previewUrl)) {
            seen.add(t.previewUrl);
            t.genre = 'Pop';
            t.id = `pop-${index}`;
            if (index === 2 || index === 12) { t.isLocked = true; t.name += ' (Restricted)'; t.previewUrl = ''; }
            results.push(t);
            index++;
          }
        }
        return results;
      }
      if (cleanKeyword === 'edm') {
        const [r1, r2, r3, r4] = await Promise.all([
          this.scrapeYouTubeSearch('best edm music festival hits electro'),
          this.scrapeYouTubeSearch('ultra edm dance party hits'),
          this.scrapeYouTubeSearch('gaming edm ncs hits'),
          this.scrapeYouTubeSearch('slap house edm viral')
        ]);
        const combined = [...r1, ...r2, ...r3, ...r4];
        const seen = new Set<string>();
        const results: TrackDto[] = [];
        let index = 0;
        for (const t of combined) {
          if (!seen.has(t.previewUrl)) {
            seen.add(t.previewUrl);
            t.genre = 'EDM';
            t.id = `edm-${index}`;
            if (index === 3 || index === 14) { t.isLocked = true; t.name += ' (VIP Only)'; t.previewUrl = ''; }
            results.push(t);
            index++;
          }
        }
        return results;
      }
      if (cleanKeyword === 'rock') {
        const [r1, r2, r3, r4] = await Promise.all([
          this.scrapeYouTubeSearch('rock classics hits bands live'),
          this.scrapeYouTubeSearch('alternative rock grunge hits'),
          this.scrapeYouTubeSearch('heavy metal rock legends'),
          this.scrapeYouTubeSearch('acoustic rock covers playlist')
        ]);
        const combined = [...r1, ...r2, ...r3, ...r4];
        const seen = new Set<string>();
        const results: TrackDto[] = [];
        let index = 0;
        for (const t of combined) {
          if (!seen.has(t.previewUrl)) {
            seen.add(t.previewUrl);
            t.genre = 'Rock';
            t.id = `rock-${index}`;
            if (index === 5 || index === 16) { t.isLocked = true; t.name += ' (VIP Only)'; t.previewUrl = ''; }
            results.push(t);
            index++;
          }
        }
        return results;
      }
      if (cleanKeyword === 'acoustic') {
        const [r1, r2, r3, r4] = await Promise.all([
          this.scrapeYouTubeSearch('acoustic pop cover love songs'),
          this.scrapeYouTubeSearch('acoustic guitar chill covers'),
          this.scrapeYouTubeSearch('indie folk acoustic playlist'),
          this.scrapeYouTubeSearch('vpop acoustic cover chill')
        ]);
        const combined = [...r1, ...r2, ...r3, ...r4];
        const seen = new Set<string>();
        const results: TrackDto[] = [];
        let index = 0;
        for (const t of combined) {
          if (!seen.has(t.previewUrl)) {
            seen.add(t.previewUrl);
            t.genre = 'Acoustic';
            t.id = `acoustic-${index}`;
            if (index === 1 || index === 11) { t.isLocked = true; t.name += ' (Restricted)'; t.previewUrl = ''; }
            results.push(t);
            index++;
          }
        }
        return results;
      }

      // Regular search query with multiple variations in parallel to achieve 100+ songs
      const [r1, r2, r3, r4] = await Promise.all([
        this.scrapeYouTubeSearch(cleanKeyword),
        this.scrapeYouTubeSearch(cleanKeyword + ' official music video'),
        this.scrapeYouTubeSearch(cleanKeyword + ' lyric audio'),
        this.scrapeYouTubeSearch(cleanKeyword + ' live acoustic remix')
      ]);
      
      const combined = [...r1, ...r2, ...r3, ...r4];
      const seen = new Set<string>();
      const results: TrackDto[] = [];
      let index = 0;
      for (const t of combined) {
        if (!seen.has(t.previewUrl)) {
          seen.add(t.previewUrl);
          t.id = `search-${index}`;
          results.push(t);
          index++;
        }
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
