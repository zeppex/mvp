import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PaymentOrderService } from './payment-order.service';
import { PaymentOrder } from '../entities/payment-order.entity';
import { BranchService } from './branch.service';
import { PosService } from './pos.service';
import { PaymentOrderStatus } from '../../shared/enums/payment-order-status.enum';
import { NotFoundException } from '@nestjs/common';

describe('PaymentOrderService', () => {
  let service: PaymentOrderService;
  let paymentOrderRepository: Repository<PaymentOrder>;
  let branchService: BranchService;
  let posService: PosService;
  let configService: ConfigService;

  const mockPaymentOrderRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      delete: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    })),
  };

  const mockBranchService = {
    findOne: jest.fn(),
  };

  const mockPosService = {
    findOne: jest.fn(),
    findOneByMerchant: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue(120000), // 2 minutes TTL
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentOrderService,
        {
          provide: getRepositoryToken(PaymentOrder),
          useValue: mockPaymentOrderRepository,
        },
        {
          provide: BranchService,
          useValue: mockBranchService,
        },
        {
          provide: PosService,
          useValue: mockPosService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PaymentOrderService>(PaymentOrderService);
    paymentOrderRepository = module.get<Repository<PaymentOrder>>(
      getRepositoryToken(PaymentOrder),
    );
    branchService = module.get<BranchService>(BranchService);
    posService = module.get<PosService>(PosService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const merchantId = 'merchant-123';
    const branchId = 'branch-123';
    const posId = 'pos-123';
    const createDto = {
      amount: '100.00',
      description: 'Test order',
      posId: posId,
    };

    it('should create ACTIVE order when no active order exists', async () => {
      mockBranchService.findOne.mockResolvedValue({ id: branchId });
      mockPosService.findOne.mockResolvedValue({ id: posId });
      mockPaymentOrderRepository.findOne.mockResolvedValue(null); // No active order
      mockPaymentOrderRepository.save.mockImplementation((order) =>
        Promise.resolve(order),
      );

      const result = await service.create(
        merchantId,
        branchId,
        posId,
        createDto,
      );

      expect(result.status).toBe(PaymentOrderStatus.ACTIVE);
      expect(result.expiresAt).toBeDefined();
      expect(mockPaymentOrderRepository.save).toHaveBeenCalled();
    });

    it('should create QUEUED order when active order exists', async () => {
      const existingActiveOrder = {
        id: 'existing-order',
        status: PaymentOrderStatus.ACTIVE,
      };

      mockBranchService.findOne.mockResolvedValue({ id: branchId });
      mockPosService.findOne.mockResolvedValue({ id: posId });
      mockPaymentOrderRepository.findOne.mockResolvedValue(existingActiveOrder);
      mockPaymentOrderRepository.save.mockImplementation((order) =>
        Promise.resolve(order),
      );

      const result = await service.create(
        merchantId,
        branchId,
        posId,
        createDto,
      );

      expect(result.status).toBe(PaymentOrderStatus.QUEUED);
      expect(result.expiresAt).toBeNull();
      expect(mockPaymentOrderRepository.save).toHaveBeenCalled();
    });
  });

  describe('createByMerchant', () => {
    const merchantId = 'merchant-123';
    const posId = 'pos-123';
    const createDto = {
      amount: '100.00',
      description: 'Test order',
      posId: posId,
    };

    it('should create ACTIVE order when no active order exists', async () => {
      const mockPos = {
        id: posId,
        branch: { id: 'branch-123' },
      };

      mockPosService.findOneByMerchant.mockResolvedValue(mockPos);
      mockPaymentOrderRepository.findOne.mockResolvedValue(null); // No active order
      mockPaymentOrderRepository.save.mockImplementation((order) =>
        Promise.resolve(order),
      );

      const result = await service.createByMerchant(
        merchantId,
        posId,
        createDto,
      );

      expect(result.status).toBe(PaymentOrderStatus.ACTIVE);
      expect(result.expiresAt).toBeDefined();
      expect(mockPaymentOrderRepository.save).toHaveBeenCalled();
    });

    it('should create QUEUED order when active order exists', async () => {
      const mockPos = {
        id: posId,
        branch: { id: 'branch-123' },
      };

      const existingActiveOrder = {
        id: 'existing-order',
        status: PaymentOrderStatus.ACTIVE,
      };

      mockPosService.findOneByMerchant.mockResolvedValue(mockPos);
      mockPaymentOrderRepository.findOne.mockResolvedValue(existingActiveOrder);
      mockPaymentOrderRepository.save.mockImplementation((order) =>
        Promise.resolve(order),
      );

      const result = await service.createByMerchant(
        merchantId,
        posId,
        createDto,
      );

      expect(result.status).toBe(PaymentOrderStatus.QUEUED);
      expect(result.expiresAt).toBeNull();
      expect(mockPaymentOrderRepository.save).toHaveBeenCalled();
    });
  });

  describe('getCurrentByMerchant', () => {
    const merchantId = 'merchant-123';
    const posId = 'pos-123';

    it('should return active order when it exists and is not expired', async () => {
      const activeOrder = {
        id: 'active-order',
        status: PaymentOrderStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 60000), // Not expired
        isExpired: jest.fn().mockReturnValue(false),
      };

      mockPosService.findOneByMerchant.mockResolvedValue({ id: posId });
      mockPaymentOrderRepository.findOne.mockResolvedValue(activeOrder);

      const result = await service.getCurrentByMerchant(merchantId, posId);

      expect(result).toBe(activeOrder);
    });

    it('should promote queued order when active order expires', async () => {
      const expiredOrder = {
        id: 'expired-order',
        status: PaymentOrderStatus.ACTIVE,
        expiresAt: new Date(Date.now() - 60000), // Expired
        isExpired: jest.fn().mockReturnValue(true),
      };

      const queuedOrder = {
        id: 'queued-order',
        status: PaymentOrderStatus.QUEUED,
        expiresAt: null,
        isExpired: jest.fn().mockReturnValue(false),
      };

      const promotedOrder = {
        id: 'queued-order',
        status: PaymentOrderStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 120000), // New TTL
        isExpired: jest.fn().mockReturnValue(false),
      };

      mockPosService.findOneByMerchant.mockResolvedValue({ id: posId });
      mockPaymentOrderRepository.findOne
        .mockResolvedValueOnce(expiredOrder) // First call for active order
        .mockResolvedValueOnce(queuedOrder); // Second call for queued order
      mockPaymentOrderRepository.save.mockResolvedValue(promotedOrder);

      const result = await service.getCurrentByMerchant(merchantId, posId);

      expect(result).toBe(promotedOrder);
      expect(mockPaymentOrderRepository.save).toHaveBeenCalledTimes(2);
      // First call should be to save the expired order
      expect(mockPaymentOrderRepository.save).toHaveBeenNthCalledWith(
        1,
        expiredOrder,
      );
      // Second call should be to save the promoted order
      expect(mockPaymentOrderRepository.save).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          id: 'queued-order',
          status: PaymentOrderStatus.ACTIVE,
        }),
      );
    });

    it('should promote queued order when no active order exists', async () => {
      const queuedOrder = {
        id: 'queued-order',
        status: PaymentOrderStatus.QUEUED,
        expiresAt: null,
        isExpired: jest.fn().mockReturnValue(false),
      };

      const promotedOrder = {
        id: 'queued-order',
        status: PaymentOrderStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 120000), // New TTL
        isExpired: jest.fn().mockReturnValue(false),
      };

      mockPosService.findOneByMerchant.mockResolvedValue({ id: posId });
      mockPaymentOrderRepository.findOne
        .mockResolvedValueOnce(null) // No active order
        .mockResolvedValueOnce(queuedOrder); // Queued order found
      mockPaymentOrderRepository.save.mockResolvedValue(promotedOrder);

      const result = await service.getCurrentByMerchant(merchantId, posId);

      expect(result).toBe(promotedOrder);
      expect(mockPaymentOrderRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'queued-order',
          status: PaymentOrderStatus.ACTIVE,
        }),
      );
    });

    it('should throw NotFoundException when no orders are available', async () => {
      mockPosService.findOneByMerchant.mockResolvedValue({ id: posId });
      mockPaymentOrderRepository.findOne
        .mockResolvedValueOnce(null) // No active order
        .mockResolvedValueOnce(null); // No queued order

      await expect(
        service.getCurrentByMerchant(merchantId, posId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelExpiredOrders', () => {
    it('should cancel expired orders', async () => {
      const expiredOrder = {
        id: 'expired-order',
        status: PaymentOrderStatus.ACTIVE,
        shouldBeCancelled: jest.fn().mockReturnValue(true),
      };

      mockPaymentOrderRepository.find.mockResolvedValue([expiredOrder]);
      mockPaymentOrderRepository.save.mockResolvedValue(expiredOrder);

      const result = await service.cancelExpiredOrders();

      expect(result).toBe(1);
      expect(expiredOrder.status).toBe(PaymentOrderStatus.EXPIRED);
      expect(mockPaymentOrderRepository.save).toHaveBeenCalledWith(
        expiredOrder,
      );
    });

    it('should not cancel non-expired orders', async () => {
      const activeOrder = {
        id: 'active-order',
        status: PaymentOrderStatus.ACTIVE,
        shouldBeCancelled: jest.fn().mockReturnValue(false),
      };

      mockPaymentOrderRepository.find.mockResolvedValue([activeOrder]);

      const result = await service.cancelExpiredOrders();

      expect(result).toBe(0);
      expect(mockPaymentOrderRepository.save).not.toHaveBeenCalled();
    });
  });
});
