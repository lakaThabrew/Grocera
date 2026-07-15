import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('product/:id')
  @ApiOperation({ summary: 'Get historical analytics for a specific product' })
  async getProductAnalytics(@Param('id') id: string) {
    return this.analyticsService.getProductAnalytics(id);
  }

  @Get('inflation')
  @ApiOperation({ summary: 'Get market inflation and macro trends' })
  async getMarketInflation() {
    return this.analyticsService.getMarketInflation();
  }
}
