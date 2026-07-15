import { Controller, Get, Param, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { PublicApiService } from './public-api.service';
import { ApiKeyGuard } from '../auth/api-key.guard';
import { ApiTags, ApiOperation, ApiQuery, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('Public API (External)')
@ApiHeader({ name: 'X-API-Key', description: 'Your public API Key', required: true })
@Controller({ path: 'public', version: '1' })
@UseGuards(ApiKeyGuard)
export class PublicApiController {
  constructor(private readonly publicApiService: PublicApiService) {}

  @Get('products')
  @ApiOperation({ summary: 'Search and list products' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'storeId', required: false, type: String })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000) // Cache for 1 minute
  async getProducts(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('storeId') storeId?: string,
  ) {
    return this.publicApiService.getProducts(
      skip ? parseInt(skip, 10) : 0,
      take ? parseInt(take, 10) : 20,
      search,
      categoryId,
      storeId,
    );
  }

  @Get('stores')
  @ApiOperation({ summary: 'List all supported stores/supermarkets' })
  @UseInterceptors(CacheInterceptor)
  @CacheKey('public_stores')
  @CacheTTL(3600000) // Cache for 1 hour
  async getStores() {
    return this.publicApiService.getStores();
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all product categories' })
  @UseInterceptors(CacheInterceptor)
  @CacheKey('public_categories')
  @CacheTTL(3600000) // Cache for 1 hour
  async getCategories() {
    return this.publicApiService.getCategories();
  }

  @Get('products/:id/history')
  @ApiOperation({ summary: 'Get historical prices for a product' })
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // Cache for 5 minutes
  async getProductHistory(@Param('id') id: string) {
    return this.publicApiService.getProductHistory(id);
  }
}
