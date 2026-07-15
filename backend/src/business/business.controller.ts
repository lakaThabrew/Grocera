import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Business Dashboard')
@Controller('business')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BUSINESS, Role.ADMIN) // Only allow Business or Admins
@ApiBearerAuth()
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('market-share/:storeId')
  @ApiOperation({ summary: 'Get market share estimation based on price leadership' })
  async getMarketShare(@Param('storeId') storeId: string) {
    return this.businessService.getMarketShare(storeId);
  }

  @Get('radar/:storeId')
  @ApiOperation({ summary: 'Get category-based competitor radar mapping' })
  async getCompetitorRadar(@Param('storeId') storeId: string) {
    return this.businessService.getCompetitorRadar(storeId);
  }

  @Get('heatmap/:storeId')
  @ApiOperation({ summary: 'Get price difference heatmap against competitors' })
  async getPricingHeatmap(@Param('storeId') storeId: string) {
    return this.businessService.getPricingHeatmap(storeId);
  }
}
