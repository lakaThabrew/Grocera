import { Test, TestingModule } from '@nestjs/testing';
import { ConsumersService } from './consumers.service';
import { PrismaService } from '../prisma.service';

describe('ConsumersService', () => {
  let service: ConsumersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumersService,
        {
          provide: PrismaService,
          useValue: {
            priceAlert: {
              findFirst: jest.fn(),
              delete: jest.fn(),
            },
            notification: {
              findFirst: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ConsumersService>(ConsumersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deletePriceAlert', () => {
    it('should delete if alert belongs to user', async () => {
      jest.spyOn(prisma.priceAlert, 'findFirst').mockResolvedValue({ id: 'alert-1', userId: 'user-1' } as any);
      jest.spyOn(prisma.priceAlert, 'delete').mockResolvedValue({} as any);

      await expect(service.deletePriceAlert('alert-1', 'user-1')).resolves.toBeDefined();
      expect(prisma.priceAlert.delete).toHaveBeenCalledWith({ where: { id: 'alert-1' } });
    });

    it('should throw if alert does not belong to user', async () => {
      jest.spyOn(prisma.priceAlert, 'findFirst').mockResolvedValue(null);

      await expect(service.deletePriceAlert('alert-1', 'user-2')).rejects.toThrow('Alert not found or unauthorized');
      expect(prisma.priceAlert.delete).not.toHaveBeenCalled();
    });
  });

  describe('markNotificationRead', () => {
    it('should mark read if notification belongs to user', async () => {
      jest.spyOn(prisma.notification, 'findFirst').mockResolvedValue({ id: 'notif-1', userId: 'user-1' } as any);
      jest.spyOn(prisma.notification, 'update').mockResolvedValue({} as any);

      await expect(service.markNotificationRead('notif-1', 'user-1')).resolves.toBeDefined();
      expect(prisma.notification.update).toHaveBeenCalledWith({ where: { id: 'notif-1' }, data: { isRead: true } });
    });

    it('should throw if notification does not belong to user', async () => {
      jest.spyOn(prisma.notification, 'findFirst').mockResolvedValue(null);

      await expect(service.markNotificationRead('notif-1', 'user-2')).rejects.toThrow('Notification not found or unauthorized');
      expect(prisma.notification.update).not.toHaveBeenCalled();
    });
  });
});
