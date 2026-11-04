import { Injectable } from '@nestjs/common';

export interface FootballMatch {
  id: string;
  homeTeam: string;
  homeLogo: string;
  awayTeam: string;
  awayLogo: string;
  league: string; // 'Ngoại Hạng Anh', 'Champions League', 'World Cup'
  score: string; // e.g., '2 - 1' or '?'
  status: 'Live' | 'Finished' | 'Upcoming';
  matchTime: string; // ISO String or text e.g., '20:00 24/10/2026'
  videoUrl: string;
}

@Injectable()
export class FootballService {
  private mockMatches: FootballMatch[] = [
    // Ngoại Hạng Anh (Premier League)
    {
      id: 'pl-1',
      homeTeam: 'Manchester United',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7a/Manchester_United_FC_crest.svg/1200px-Manchester_United_FC_crest.svg.png',
      awayTeam: 'Arsenal',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png',
      league: 'Ngoại Hạng Anh',
      score: '1 - 2',
      status: 'Finished',
      matchTime: '22:30 14/06/2026',
      videoUrl: 'assets/pl.mp4',
    },
    {
      id: 'pl-2',
      homeTeam: 'Manchester City',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png',
      awayTeam: 'Liverpool',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png',
      league: 'Ngoại Hạng Anh',
      score: '0 - 0',
      status: 'Live',
      matchTime: 'Phút 35',
      videoUrl: 'assets/pl.mp4',
    },
    {
      id: 'pl-3',
      homeTeam: 'Chelsea',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/5/5c/Chelsea_crest.svg/1200px-Chelsea_crest.svg.png',
      awayTeam: 'Tottenham Hotspur',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/Tottenham_Hotspur.svg/1200px-Tottenham_Hotspur.svg.png',
      league: 'Ngoại Hạng Anh',
      score: '?',
      status: 'Upcoming',
      matchTime: '20:00 16/06/2026',
      videoUrl: '', 
    },
    // Champions League (C1)
    {
      id: 'c1-1',
      homeTeam: 'Real Madrid',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png',
      awayTeam: 'Bayern Munich',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png',
      league: 'Champions League',
      score: '3 - 1',
      status: 'Finished',
      matchTime: '02:00 12/06/2026',
      videoUrl: 'assets/c1.mp4',
    },
    {
      id: 'c1-2',
      homeTeam: 'Barcelona',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/9/91/FC_Barcelona_logo.svg/1200px-FC_Barcelona_logo.svg.png',
      awayTeam: 'PSG',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/1200px-Paris_Saint-Germain_F.C..svg.png',
      league: 'Champions League',
      score: '2 - 1',
      status: 'Live',
      matchTime: 'Phút 78',
      videoUrl: 'assets/c1.mp4',
    },
    // World Cup 2026 (Finished)
    {
      id: 'wc-mex-nga',
      homeTeam: 'Mexico',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/14/Mexico_national_football_team_crest.svg/1200px-Mexico_national_football_team_crest.svg.png',
      awayTeam: 'Nigeria',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Nigeria_national_football_team_logo.svg/1200px-Nigeria_national_football_team_logo.svg.png',
      league: 'World Cup',
      score: '2 - 1',
      status: 'Finished',
      matchTime: '02:00 12/06/2026 (Opening)',
      videoUrl: 'https://www.youtube.com/watch?v=p1kDIae0LGo',
    },
    {
      id: 'wc-usa-col',
      homeTeam: 'USA',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/United_States_Men%27s_National_Soccer_Team_logo.svg/1200px-United_States_Men%27s_National_Soccer_Team_logo.svg.png',
      awayTeam: 'Colombia',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Federaci%C3%B3n_Colombiana_de_F%C3%BAtbol_logo.svg/1200px-Federaci%C3%B3n_Colombiana_de_F%C3%BAtbol_logo.svg.png',
      league: 'World Cup',
      score: '1 - 1',
      status: 'Finished',
      matchTime: '08:00 13/06/2026',
      videoUrl: 'https://www.youtube.com/watch?v=vf6qrdSeZaY',
    },
    {
      id: 'wc-can-nor',
      homeTeam: 'Canada',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Canada_Soccer_logo.svg/1200px-Canada_Soccer_logo.svg.png',
      awayTeam: 'Norway',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Norges_Fotballforbund_logo.svg/1200px-Norges_Fotballforbund_logo.svg.png',
      league: 'World Cup',
      score: '0 - 2',
      status: 'Finished',
      matchTime: '23:00 14/06/2026',
      videoUrl: 'https://www.youtube.com/watch?v=NKk0pm4cyxM',
    },
    // World Cup 2026 (Live)
    {
      id: 'wc-arg-swe',
      homeTeam: 'Argentina',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Argentine_Football_Association_logo.svg/1200px-Argentine_Football_Association_logo.svg.png',
      awayTeam: 'Sweden',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/22/Swedish_Football_Association_logo.svg/1200px-Swedish_Football_Association_logo.svg.png',
      league: 'World Cup',
      score: '2 - 0',
      status: 'Live',
      matchTime: 'Phút 60',
      videoUrl: 'https://www.youtube.com/watch?v=p1kDIae0LGo',
    },
    {
      id: 'wc-eng-egy',
      homeTeam: 'England',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/b4/England_crest_2020.svg/1200px-England_crest_2020.svg.png',
      awayTeam: 'Egypt',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/be/Egyptian_Football_Association.svg/1200px-Egyptian_Football_Association.svg.png',
      league: 'World Cup',
      score: '0 - 0',
      status: 'Live',
      matchTime: 'Phút 15',
      videoUrl: 'https://www.youtube.com/watch?v=vf6qrdSeZaY',
    },
    // World Cup 2026 (Upcoming)
    {
      id: 'wc-ger-esp',
      homeTeam: 'Germany',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e3/DFB_Logo_1995.svg/1200px-DFB_Logo_1995.svg.png',
      awayTeam: 'Spain',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/31/Spain_National_Football_Team_badge.svg/1200px-Spain_National_Football_Team_badge.svg.png',
      league: 'World Cup',
      score: '?',
      status: 'Upcoming',
      matchTime: '02:00 16/06/2026',
      videoUrl: '',
    },
    {
      id: 'wc-bra-por',
      homeTeam: 'Brazil',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Brazilian_Football_Confederation_logo.svg/1200px-Brazilian_Football_Confederation_logo.svg.png',
      awayTeam: 'Portugal',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/Portuguese_Football_Federation.svg/1200px-Portuguese_Football_Federation.svg.png',
      league: 'World Cup',
      score: '?',
      status: 'Upcoming',
      matchTime: '23:00 17/06/2026',
      videoUrl: '',
    },
    {
      id: 'wc-fra-ita',
      homeTeam: 'France',
      homeLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4b/France_national_football_team_seal.svg/1200px-France_national_football_team_seal.svg.png',
      awayTeam: 'Italy',
      awayLogo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/FIGC_logo_2021.svg/1200px-FIGC_logo_2021.svg.png',
      league: 'World Cup',
      score: '?',
      status: 'Upcoming',
      matchTime: '02:00 18/06/2026',
      videoUrl: '',
    }
  ];

  getMatches(league?: string, status?: string): FootballMatch[] {
    let filtered = this.mockMatches;
    if (league && league !== 'All') {
      filtered = filtered.filter(m => m.league === league);
    }
    if (status && status !== 'All') {
      filtered = filtered.filter(m => m.status === status);
    }
    return filtered;
  }
}
