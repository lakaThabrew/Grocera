import { Test, TestingModule } from '@nestjs/testing';
import { BusinessService } from './business.service';
import { PrismaService } from '../prisma.service';

describe('BusinessService', () => {
  let service: BusinessService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessService,
        {
          provide: PrismaService,
          useValue: {
            category: { findMany: jest.fn().mockResolvedValue([]) },
            product: { findMany: jest.fn().mockResolvedValue([]) },
            store: { findMany: jest.fn().mockResolvedValue([]) },
          },
        },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getCompetitorRadar should return empty array if no categories', async () => {
    const result = await service.getCompetitorRadar('store-1');
    expect(result).toEqual([]);
  });

  it('getPricingHeatmap should return empty data if no categories', async () => {
    const result = await service.getPricingHeatmap('store-1');
    expect(result.data).toEqual([]);
  });
});
