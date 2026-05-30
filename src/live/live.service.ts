import { Injectable, Logger } from '@nestjs/common';

export interface LiveDto {
  id: string;
  name: string;
  channel: string;
  coverUrl: string;
  previewUrl: string;
  durationMs: number;
  embedUrl: string;
  popularity: number;
}

@Injectable()
export class LiveService {
  private readonly logger = new Logger(LiveService.name);

  async getLiveBeautyPageants(): Promise<LiveDto[]> {
    this.logger.log('Fetching CURRENTLY LIVE beauty pageants from YouTube (Verified Embeddable Only)');
    
    try {
      const queries = [
        'miss grand international live',
        'miss universe live',
        'miss grand all stars live'
      ];
      
      const seen = new Set<string>();
      const results: LiveDto[] = [];
      let index = 0;
      
      for (const query of queries) {
        const batch = await this.scrapeYouTubeLive(query);
        for (const t of batch) {
          if (!seen.has(t.previewUrl)) {
            seen.add(t.previewUrl);
            t.id = `live-${index}`;
            results.push(t);
            index++;
          }
        }
        if (results.length >= 8) break; // Limit to 8 concurrent live streams to be fast
      }
      
      if (results.length > 0) {
        return results;
      }
    } catch (e) {
      this.logger.error('Failed to scrape live beauty pageants', e);
    }
    
    // Fallback just in case nothing is live right now
    return [
      {
        id: 'live-fallback',
        name: 'Miss Grand All Stars Final Competition (Live Replay)',
        channel: 'MGI Fans',
        coverUrl: 'https://i.ytimg.com/vi/KjDa5oAVm7Y/hqdefault.jpg',
        previewUrl: 'KjDa5oAVm7Y',
        durationMs: 14400000,
        embedUrl: 'https://www.youtube.com/embed/KjDa5oAVm7Y',
        popularity: 15000
      }
    ];
  }

  private async scrapeYouTubeLive(query: string): Promise<LiveDto[]> {
    // sp=EgJAAQ%253D%253D is the filter for CURRENTLY LIVE streams
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgJAAQ%253D%253D`;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });
      
      let html: string | null = await response.text();
      
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
      html = null;
      
      const data = JSON.parse(jsonStr);
      const results: LiveDto[] = [];
      const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
      
      if (!contents || !Array.isArray(contents)) return [];
      
      // Filter videos and check embeddability
      for (const item of contents) {
        const video = item.videoRenderer;
        if (video && video.videoId) {
          const videoId = video.videoId;
          
          // Verify if the video allows embedding to prevent Error 153!
          try {
            const vidRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
              }
            });
            const vidHtml = await vidRes.text();
            const isEmbeddable = vidHtml.includes('"playableInEmbed":true');
            
            if (isEmbeddable) {
              let title = video.title?.runs?.[0]?.text || 'Live Stream';
              let channel = video.ownerText?.runs?.[0]?.text || 'YouTube Channel';
              const coverUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
              
              results.push({
                id: `yt-${videoId}`,
                name: title,
                channel: channel,
                coverUrl: coverUrl,
                previewUrl: videoId,
                durationMs: 14400000, // Live streams don't have fixed duration
                embedUrl: `https://www.youtube.com/embed/${videoId}`,
                popularity: parseInt(video.viewCountText?.simpleText?.replace(/\D/g, '') || '5000')
              });
            }
          } catch (e) {
            // Ignore error for individual video check
          }
          
          if (results.length >= 4) break; // Get top 4 embeddable live streams per query
        }
      }
      return results;
    } catch (error) {
      this.logger.error('Error scraping YouTube search', error);
      return [];
    }
  }
}
