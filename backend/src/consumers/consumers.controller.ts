import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Delete,
  Patch,
  Req,
} from '@nestjs/common';
import { ConsumersService } from './consumers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Consumers')
@Controller('consumers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConsumersController {
  constructor(private readonly consumersService: ConsumersService) {}

  // ---- Favorites ----

  @Get('favorites/products')
  @ApiOperation({ summary: 'Get favorite products (Wishlist)' })
  async getFavoriteProducts(@Req() req) {
    return this.consumersService.getFavoriteProducts(req.user.userId);
  }

  @Post('favorites/products/:id')
  @ApiOperation({ summary: 'Toggle product in wishlist' })
  async toggleFavoriteProduct(@Req() req, @Param('id') productId: string) {
    return this.consumersService.toggleFavoriteProduct(
      req.user.userId,
      productId,
    );
  }

  // ---- Price Alerts ----

  @Get('alerts')
  @ApiOperation({ summary: 'Get active price alerts' })
  async getPriceAlerts(@Req() req) {
    return this.consumersService.getPriceAlerts(req.user.userId);
  }

  @Post('alerts')
  @ApiOperation({ summary: 'Create a new price alert' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
        targetPrice: { type: 'number' },
        emailAlert: { type: 'boolean' },
        smsAlert: { type: 'boolean' },
        pushAlert: { type: 'boolean' },
      },
    },
  })
  async createPriceAlert(@Req() req, @Body() body: any) {
    return this.consumersService.createPriceAlert(
      req.user.userId,
      body.productId,
      body.targetPrice,
      { email: body.emailAlert, sms: body.smsAlert, push: body.pushAlert },
    );
  }

  @Patch('alerts/:id')
  @ApiOperation({ summary: 'Update price alert' })
  async updatePriceAlert(@Req() req, @Param('id') id: string) {
    return this.consumersService.togglePriceAlert(id, req.user.userId);
  }

  @Patch('alerts/:id/toggle')
  @ApiOperation({ summary: 'Toggle alert active status' })
  async togglePriceAlert(@Req() req, @Param('id') id: string) {
    return this.consumersService.togglePriceAlert(id, req.user.userId);
  }

  @Delete('alerts/:id')
  @ApiOperation({ summary: 'Delete a price alert' })
  async deletePriceAlert(@Req() req, @Param('id') id: string) {
    return this.consumersService.deletePriceAlert(id, req.user.userId);
  }

  // ---- Notifications ----

  @Get('notifications')
  @ApiOperation({ summary: 'Get user notifications' })
  async getNotifications(@Req() req) {
    return this.consumersService.getNotifications(req.user.userId);
  }

  @Patch('notifications/:id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markNotificationRead(@Req() req, @Param('id') id: string) {
    return this.consumersService.markNotificationRead(id, req.user.userId);
  }
}
