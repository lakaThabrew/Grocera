import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma.service';

describe('AiService', () => {
  let service: AiService;

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY_BACKUP;
  });

  it('should not throw on instantiation if no API key is set', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    expect(service).toBeDefined();
  });

  it('normalizeProduct should fallback gracefully if AI disabled', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    const result = await service.normalizeProduct('Test Product 1kg');
    expect(result.canonicalName).toBe('Test Product 1kg');
    expect(result.brand).toBeNull();
  });
});
