import { Controller, Get, Query } from '@nestjs/common';
import { FootballService } from './football.service';

@Controller('football')
export class FootballController {
  constructor(private readonly footballService: FootballService) {}

  @Get('matches')
  getMatches(
    @Query('league') league?: string,
    @Query('status') status?: string,
  ) {
    return {
      status: 200,
      message: 'Lấy danh sách trận đấu thành công',
      data: this.footballService.getMatches(league, status),
    };
  }
}
