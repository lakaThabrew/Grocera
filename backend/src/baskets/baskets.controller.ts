import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { BasketsService } from './baskets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

class OptimizeBasketDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  shoppingList: string[];
}

@ApiTags('Baskets')
@Controller('baskets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BasketsController {
  constructor(private readonly basketsService: BasketsService) {}

  @Post('optimize')
  @ApiOperation({
    summary: 'Optimize a shopping list across multiple supermarkets',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        shoppingList: {
          type: 'array',
          items: { type: 'string' },
          example: ['Rice', 'Milk', 'Eggs'],
        },
      },
    },
  })
  async optimizeBasket(@Body() dto: OptimizeBasketDto) {
    if (!dto.shoppingList || dto.shoppingList.length === 0) {
      return {
        strategy: 'NONE',
        totalCost: 0,
        totalSavings: 0,
        travelCost: 0,
        storesToVisit: [],
        items: [],
        aiExplanation: 'Your shopping list is empty.',
      };
    }
    return this.basketsService.optimizeBasket(dto.shoppingList);
  }
}
