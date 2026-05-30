import { Controller, Get } from '@nestjs/common';
import { LiveService, LiveDto } from './live.service';

@Controller('live')
export class LiveController {
  constructor(private readonly liveService: LiveService) {}

  @Get('pageants')
  async getLivePageants(): Promise<{ status: number; data: LiveDto[] }> {
    const data = await this.liveService.getLiveBeautyPageants();
    return {
      status: 200,
      data,
    };
  }
}
