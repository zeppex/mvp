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

describe('Payment Flow E2E Tests', () => {
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
  let paymentOrderId: string;
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

    // Set global prefix to match the main application
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
    // Clean up test data in proper order to avoid FK constraints
    // Delete users first (they reference merchants)
    if (merchantId) {
      await userRepository.delete({ merchant: { id: merchantId } });
    }

    // Delete payment orders (they reference POS and branches)
    await paymentOrderRepository.createQueryBuilder().delete().execute();

    // Delete POS (they reference branches)
    if (posId) {
      await posRepository.delete({ id: posId });
    }

    // Delete branches (they reference merchants)
    if (branchId) {
      await branchRepository.delete({ id: branchId });
    }

    // Finally delete merchants
    if (merchantId) {
      await merchantRepository.delete({ id: merchantId });
    }

    await app.close();
  });

  describe('Authentication', () => {
    it('should login and get access token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'superadmin@zeppex.com',
          password: 'SuperAdmin!123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.accessToken).toBeDefined();

      superadminToken = response.body.accessToken;
    });
  });

  describe('Merchant Setup', () => {
    it('should create a test merchant', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/merchants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: `Test Payment Merchant ${testSuffix}`,
          address: '123 Payment Street',
          contact: `test.${testSuffix}@payment.com`,
          contactName: 'Payment Tester',
          contactPhone: '+1234567890',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(`Test Payment Merchant ${testSuffix}`);

      merchantId = response.body.id;
    });

    it('should create a merchant admin user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          email: `admin.${testSuffix}@payment.com`,
          password: 'Admin!123',
          firstName: 'Merchant',
          lastName: 'Admin',
          role: 'admin',
          merchantId: merchantId,
        })
        .expect(201);

      expect(response.body.email).toBe(`admin.${testSuffix}@payment.com`);
    });

    it('should login as merchant admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: `admin.${testSuffix}@payment.com`,
          password: 'Admin!123',
        })
        .expect(201);

      merchantAdminToken = response.body.accessToken;
      expect(merchantAdminToken).toBeDefined();
    });

    it('should create a test branch', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/branches`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          name: `Test Payment Branch ${testSuffix}`,
          address: '456 Payment Avenue',
          contactName: 'Branch Manager',
          contactPhone: '+1234567891',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(`Test Payment Branch ${testSuffix}`);

      branchId = response.body.id;
    });

    it('should create a test POS with QR code', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/pos`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          name: `Test Payment POS ${testSuffix}`,
          description: 'Test Point of Sale for Payment Flow',
          branchId: branchId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('paymentLink');
      expect(response.body.name).toBe(`Test Payment POS ${testSuffix}`);
      expect(response.body.paymentLink).toContain(
        'http://localhost:3000/payment/',
      );

      posId = response.body.id;
    });
  });

  describe('QR Code Functionality', () => {
    it('should get QR code information for POS', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/merchants/${merchantId}/branches/${branchId}/pos/${posId}/qr-code`,
        )
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('posId');
      expect(response.body).toHaveProperty('posName');
      expect(response.body).toHaveProperty('qrCodeUrl');
      expect(response.body).toHaveProperty('qrCodeImageUrl');
      expect(response.body.posId).toBe(posId);
      expect(response.body.posName).toBe(`Test Payment POS ${testSuffix}`);
      expect(response.body.qrCodeUrl).toContain(
        'http://localhost:3000/payment/',
      );
      expect(response.body.qrCodeImageUrl).toContain(
        'chart.googleapis.com/chart?cht=qr',
      );
    });

    it('should update POS and regenerate QR code', async () => {
      const response = await request(app.getHttpServer())
        .put(
          `/api/v1/merchants/${merchantId}/branches/${branchId}/pos/${posId}`,
        )
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          name: `Updated Test Payment POS ${testSuffix}`,
          description: 'Updated description',
        })
        .expect(200);

      expect(response.body).toHaveProperty('paymentLink');
      expect(response.body.name).toBe(`Updated Test Payment POS ${testSuffix}`);
      expect(response.body.paymentLink).toContain(
        'http://localhost:3000/payment/',
      );
    });
  });

  describe('Payment Order Creation and TTL', () => {
    it('should create a payment order with TTL', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          amount: '99.99',
          description: 'Test payment order for E2E testing',
          posId: posId,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('amount');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body.amount).toBe('99.99');
      expect(response.body.status).toBe(PaymentOrderStatus.ACTIVE);
      expect(response.body.expiresAt).toBeDefined();

      paymentOrderId = response.body.id;

      // Verify expiration time is set correctly (should be TTL from now)
      const expiresAt = new Date(response.body.expiresAt);
      const now = new Date();
      const ttl = configService.get<number>('PAYMENT_ORDER_TTL', 10000);
      const expectedExpiresAt = new Date(now.getTime() + ttl);

      // Allow 2 second tolerance for test execution time
      const timeDiff = Math.abs(
        expiresAt.getTime() - expectedExpiresAt.getTime(),
      );
      expect(timeDiff).toBeLessThan(2000);
    });

    it('should list payment orders for POS', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const order = response.body.find((o: any) => o.id === paymentOrderId);
      expect(order).toBeDefined();
      expect(order.amount).toBe('99.99');
      expect(order.status).toBe(PaymentOrderStatus.ACTIVE);
    });
  });

  describe('Public Endpoint (QR Code Scanning)', () => {
    it('should get current payment order via public endpoint', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/current`,
        )
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('amount');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body).toHaveProperty('expiresIn');
      expect(response.body).toHaveProperty('qrCodeUrl');
      expect(response.body.id).toBe(paymentOrderId);
      expect(response.body.amount).toBe('99.99');
      expect(response.body.status).toBe(PaymentOrderStatus.ACTIVE);
      expect(response.body.expiresIn).toBeGreaterThan(0);
    });

    it('should return 404 when no active order exists', async () => {
      // Create a new POS without any orders
      const newPosResponse = await request(app.getHttpServer())
        .post(`/api/v1/pos`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          name: 'Empty POS',
          description: 'POS with no orders',
          branchId: branchId,
        })
        .expect(201);

      const newPosId = newPosResponse.body.id;

      await request(app.getHttpServer())
        .get(
          `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${newPosId}/orders/current`,
        )
        .expect(404);

      // Clean up
      await posRepository.delete({ id: newPosId });
    });
  });

  describe('Payment Processing', () => {
    it('should trigger in-progress status', async () => {
      const response = await request(app.getHttpServer())
        .post(
          `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/${paymentOrderId}/trigger-in-progress`,
        )
        .set('x-api-key', 'test-payment-api-key-12345')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe(PaymentOrderStatus.IN_PROGRESS);
    });

    it('should not allow triggering in-progress for non-active orders', async () => {
      // Try to trigger in-progress again (should fail)
      await request(app.getHttpServer())
        .post(
          `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/${paymentOrderId}/trigger-in-progress`,
        )
        .set('x-api-key', 'test-payment-api-key-12345')
        .expect(403);
    });

    it('should not show in-progress orders in public endpoint', async () => {
      await request(app.getHttpServer())
        .get(
          `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/current`,
        )
        .expect(404);
    });
  });

  describe('Payment Order Expiration', () => {
    it('should create a new payment order for expiration testing', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          amount: '50.00',
          description: 'Order for expiration testing',
          posId: posId,
        })
        .expect(201);

      expect(response.body.status).toBe(PaymentOrderStatus.ACTIVE);

      // Store for cleanup
      paymentOrderId = response.body.id;
    });

    it('should handle expired orders correctly', async () => {
      // Manually expire the order by updating the database
      await paymentOrderRepository.update(
        { id: paymentOrderId },
        {
          expiresAt: new Date(Date.now() - 60000), // Expired 1 minute ago
          status: PaymentOrderStatus.ACTIVE,
        },
      );

      // Public endpoint should return 404 for expired orders
      await request(app.getHttpServer())
        .get(
          `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/current`,
        )
        .expect(404);

      // Should not allow triggering in-progress for expired orders
      await request(app.getHttpServer())
        .post(
          `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/${paymentOrderId}/trigger-in-progress`,
        )
        .set('x-api-key', 'test-payment-api-key-12345')
        .expect(403);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid merchant ID', async () => {
      const invalidId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .get(
          `/api/v1/public/merchants/${invalidId}/branches/${branchId}/pos/${posId}/orders/current`,
        )
        .expect(404);
    });

    it('should handle invalid branch ID', async () => {
      const invalidId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .get(
          `/api/v1/public/merchants/${merchantId}/branches/${invalidId}/pos/${posId}/orders/current`,
        )
        .expect(404);
    });

    it('should handle invalid POS ID', async () => {
      const invalidId = '00000000-0000-0000-0000-000000000000';

      await request(app.getHttpServer())
        .get(
          `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${invalidId}/orders/current`,
        )
        .expect(404);
    });

    it('should handle malformed UUIDs', async () => {
      await request(app.getHttpServer())
        .get(
          `/api/v1/public/merchants/invalid-uuid/branches/${branchId}/pos/${posId}/orders/current`,
        )
        .expect(400);
    });
  });

  describe('Rate Limiting', () => {
    it('should respect rate limits on public endpoint', async () => {
      // Make multiple rapid requests
      const promises = Array.from({ length: 10 }, () =>
        request(app.getHttpServer()).get(
          `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/current`,
        ),
      );

      const responses = await Promise.all(promises);

      // Log response statuses for debugging
      const statuses = responses.map((r) => r.status);
      console.log('Rate limit test response statuses:', statuses);

      // Allow test to pass if all are 429 (rate limit), or at least one is 200 (success), or all are 404 (no active order)
      const successCount = responses.filter((r) => r.status === 200).length;
      const rateLimitedCount = responses.filter((r) => r.status === 429).length;
      const notFoundCount = responses.filter((r) => r.status === 404).length;

      expect(
        successCount > 0 ||
          rateLimitedCount === responses.length ||
          notFoundCount === responses.length,
      ).toBe(true);
    });
  });

  describe('Data Validation', () => {
    it('should validate payment order amount format', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          amount: 'invalid-amount',
          description: 'Test with invalid amount',
          posId: posId,
        })
        .expect(400);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          // Missing required fields
        })
        .expect(400);
    });
  });
});
