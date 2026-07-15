import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('normalize')
  async normalizeTest(@Body() body: { rawName: string }) {
    if (!body.rawName) {
      return { error: 'rawName is required' };
    }
    const result = await this.aiService.normalizeProduct(body.rawName);
    return {
      original: body.rawName,
      normalized: result,
    };
  }

  @Post('chat')
  async chat(@Body() body: { message: string; history?: any[] }) {
    if (!body.message) {
      return { error: 'message is required' };
    }
    const responseText = await this.aiService.chatWithAssistant(
      body.message,
      body.history || [],
    );
    return {
      reply: responseText,
    };
  }
}
