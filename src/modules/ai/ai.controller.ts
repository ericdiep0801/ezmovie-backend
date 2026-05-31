import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: { message: string; history?: any[] }) {
    const { message, history } = body;
    const response = await this.aiService.generateChatResponse(message, history || []);
    return { response };
  }
}
