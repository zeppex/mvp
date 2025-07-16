import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentOrder } from '../../src/merchant/entities/payment-order.entity';
import { Pos } from '../../src/merchant/entities/pos.entity';
import { Branch } from '../../src/merchant/entities/branch.entity';
import { Merchant } from '../../src/merchant/entities/merchant.entity';
import { User } from '../../src/user/entities/user.entity';
import { PaymentOrderStatus } from '../../src/shared/enums/payment-order-status.enum';

describe('Payment Order Queue E2E Tests', () => {
  let app: INestApplication;
  let configService: ConfigService;
  let paymentOrderRepository: Repository<PaymentOrder>;
  let posRepository: Repository<Pos>;
  let branchRepository: Repository<Branch>;
  let merchantRepository: Repository<Merchant>;
  let userRepository: Repository<User>;

  let superadminToken: string;
  let merchantAdminToken: string;
  let merchantId: string;
  let branchId: string;
  let posId: string;
  const testSuffix = Math.random().toString(36).substring(2, 8);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();

    configService = moduleFixture.get<ConfigService>(ConfigService);
    paymentOrderRepository = moduleFixture.get<Repository<PaymentOrder>>(
      getRepositoryToken(PaymentOrder),
    );
    posRepository = moduleFixture.get<Repository<Pos>>(getRepositoryToken(Pos));
    branchRepository = moduleFixture.get<Repository<Branch>>(
      getRepositoryToken(Branch),
    );
    merchantRepository = moduleFixture.get<Repository<Merchant>>(
      getRepositoryToken(Merchant),
    );
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
  });

  afterAll(async () => {
    // Clean up test data
    if (merchantId) {
      await userRepository.delete({ merchant: { id: merchantId } });
    }
    await paymentOrderRepository.createQueryBuilder().delete().execute();
    if (posId) {
      await posRepository.delete({ id: posId });
    }
    if (branchId) {
      await branchRepository.delete({ id: branchId });
    }
    if (merchantId) {
      await merchantRepository.delete({ id: merchantId });
    }
    await app.close();
  });

  describe('Setup', () => {
    it('should login as superadmin', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'superadmin@zeppex.com',
          password: 'SuperAdmin!123',
        })
        .expect(201);

      superadminToken = response.body.accessToken;
    });

    it('should create test merchant', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/merchants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: `Queue Test Merchant ${testSuffix}`,
          address: '123 Queue Street',
          contact: `queue.${testSuffix}@test.com`,
          contactName: 'Queue Tester',
          contactPhone: '+1234567890',
        })
        .expect(201);

      merchantId = response.body.id;
    });

    it('should create merchant admin user', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          email: `queue.admin.${testSuffix}@test.com`,
          password: 'Admin!123',
          firstName: 'Queue',
          lastName: 'Admin',
          role: 'admin',
          merchantId: merchantId,
        })
        .expect(201);
    });

    it('should login as merchant admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: `queue.admin.${testSuffix}@test.com`,
          password: 'Admin!123',
        })
        .expect(201);

      merchantAdminToken = response.body.accessToken;
    });

    it('should create test branch', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/branches`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          name: `Queue Test Branch ${testSuffix}`,
          address: '456 Queue Avenue',
          contactName: 'Queue Manager',
          contactPhone: '+1234567891',
        })
        .expect(201);

      branchId = response.body.id;
    });

    it('should create test POS', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/pos`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          name: `Queue Test POS ${testSuffix}`,
          description: 'Test POS for Queue Testing',
          branchId: branchId,
        })
        .expect(201);

      posId = response.body.id;
    });
  });

  describe('Payment Order Queue Functionality', () => {
    it('should create first payment order as ACTIVE', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          amount: '100.00',
          description: 'First order - should be ACTIVE',
          posId: posId,
        })
        .expect(201);

      expect(response.body.status).toBe(PaymentOrderStatus.ACTIVE);
      expect(response.body.expiresAt).toBeDefined();
    });

    it('should create second payment order as QUEUED when first is ACTIVE', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          amount: '200.00',
          description: 'Second order - should be QUEUED',
          posId: posId,
        })
        .expect(201);

      expect(response.body.status).toBe(PaymentOrderStatus.QUEUED);
      expect(response.body.expiresAt).toBeNull();
    });

    it('should create third payment order as QUEUED', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          amount: '300.00',
          description: 'Third order - should be QUEUED',
          posId: posId,
        })
        .expect(201);

      expect(response.body.status).toBe(PaymentOrderStatus.QUEUED);
      expect(response.body.expiresAt).toBeNull();
    });

    it('should list all payment orders with correct statuses', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);

      const orders = response.body.filter((o: any) => o.pos?.id === posId);
      expect(orders.length).toBeGreaterThanOrEqual(3);

      const activeOrders = orders.filter(
        (o: any) => o.status === PaymentOrderStatus.ACTIVE,
      );
      const queuedOrders = orders.filter(
        (o: any) => o.status === PaymentOrderStatus.QUEUED,
      );

      expect(activeOrders.length).toBe(1);
      expect(queuedOrders.length).toBeGreaterThanOrEqual(2);
    });

    it('should get current active order via public endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/public/payment-order/pos/${posId}`)
        .expect(200);

      expect(response.body.status).toBe(PaymentOrderStatus.ACTIVE);
      expect(response.body.amount).toBe('100.00');
    });

    it('should promote next queued order when active order expires', async () => {
      // Get the active order and manually expire it
      const activeOrder = await paymentOrderRepository.findOne({
        where: {
          pos: { id: posId },
          status: PaymentOrderStatus.ACTIVE,
        },
      });

      expect(activeOrder).toBeDefined();

      // Manually expire the active order
      await paymentOrderRepository.update(
        { id: activeOrder!.id },
        {
          expiresAt: new Date(Date.now() - 60000), // Expired 1 minute ago
        },
      );

      // Now get the current order - it should promote the next queued order
      const response = await request(app.getHttpServer())
        .get(`/api/v1/public/payment-order/pos/${posId}`)
        .expect(200);

      expect(response.body.status).toBe(PaymentOrderStatus.ACTIVE);
      expect(response.body.amount).toBe('200.00'); // Second order should now be active
      expect(response.body.expiresAt).toBeDefined(); // Should have new TTL
    });

    it('should maintain FIFO order when promoting queued orders', async () => {
      // Expire the current active order again
      const activeOrder = await paymentOrderRepository.findOne({
        where: {
          pos: { id: posId },
          status: PaymentOrderStatus.ACTIVE,
        },
      });

      await paymentOrderRepository.update(
        { id: activeOrder!.id },
        {
          expiresAt: new Date(Date.now() - 60000),
        },
      );

      // Get current order - should be the third order (FIFO)
      const response = await request(app.getHttpServer())
        .get(`/api/v1/public/payment-order/pos/${posId}`)
        .expect(200);

      expect(response.body.status).toBe(PaymentOrderStatus.ACTIVE);
      expect(response.body.amount).toBe('300.00'); // Third order should now be active
    });

    it('should return 404 when no orders are available', async () => {
      // Expire the last active order
      const activeOrder = await paymentOrderRepository.findOne({
        where: {
          pos: { id: posId },
          status: PaymentOrderStatus.ACTIVE,
        },
      });

      await paymentOrderRepository.update(
        { id: activeOrder!.id },
        {
          expiresAt: new Date(Date.now() - 60000),
        },
      );

      // Should return 404 as no more queued orders
      await request(app.getHttpServer())
        .get(`/api/v1/public/payment-order/pos/${posId}`)
        .expect(404);
    });

    it('should create new order as ACTIVE when no active order exists', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          amount: '400.00',
          description:
            'New order - should be ACTIVE since no active order exists',
          posId: posId,
        })
        .expect(201);

      expect(response.body.status).toBe(PaymentOrderStatus.ACTIVE);
      expect(response.body.expiresAt).toBeDefined();
    });
  });

  describe('Queue Status Validation', () => {
    it('should validate QUEUED status in enum', () => {
      expect(PaymentOrderStatus.QUEUED).toBe('QUEUED');
      expect(Object.values(PaymentOrderStatus)).toContain('QUEUED');
    });

    it('should handle QUEUED status in order updates', async () => {
      // Create a queued order
      const queuedOrder = await paymentOrderRepository.findOne({
        where: {
          pos: { id: posId },
          status: PaymentOrderStatus.QUEUED,
        },
      });

      if (queuedOrder) {
        const response = await request(app.getHttpServer())
          .put(`/api/v1/orders/${queuedOrder.id}`)
          .set('Authorization', `Bearer ${merchantAdminToken}`)
          .send({
            description: 'Updated queued order description',
          })
          .expect(200);

        expect(response.body.status).toBe(PaymentOrderStatus.QUEUED);
        expect(response.body.description).toBe(
          'Updated queued order description',
        );
      }
    });
  });
});
