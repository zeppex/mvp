import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../../src/app.module';
import { PaymentOrder } from '../../src/merchant/entities/payment-order.entity';
import { Pos } from '../../src/merchant/entities/pos.entity';
import { Branch } from '../../src/merchant/entities/branch.entity';
import { Merchant } from '../../src/merchant/entities/merchant.entity';
import { PaymentOrderStatus } from '../../src/shared/enums/payment-order-status.enum';
import { User } from '../../src/user/entities/user.entity';
import { getRepositoryToken as getAdminRepositoryToken } from '@nestjs/typeorm';
import { createTestingModule, testConfig } from './payment-flow.config';

describe('Payment Flow TTL Tests', () => {
  let app: INestApplication;
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
    const moduleFixture: TestingModule = await createTestingModule();

    app = moduleFixture.createNestApplication();

    // Set global prefix to match the main application
    app.setGlobalPrefix('api/v1');

    await app.init();

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

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'superadmin@zeppex.com',
        password: 'SuperAdmin!123',
      });

    superadminToken = loginResponse.body.accessToken;

    // Create test data
    const merchantResponse = await request(app.getHttpServer())
      .post('/api/v1/merchants')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        name: `TTL Test Merchant ${testSuffix}`,
        address: '123 TTL Street',
        contact: `ttl.${testSuffix}@test.com`,
        contactName: 'TTL Tester',
        contactPhone: '+1234567890',
      });

    merchantId = merchantResponse.body.id;

    // Create merchant admin user
    await request(app.getHttpServer())
      .post('/api/v1/admin/users')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        email: `admin.${testSuffix}@ttl.com`,
        password: 'Admin!123',
        firstName: 'TTL',
        lastName: 'Admin',
        role: 'admin',
        merchantId: merchantId,
      });

    // Login as merchant admin
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: `admin.${testSuffix}@ttl.com`,
        password: 'Admin!123',
      });

    merchantAdminToken = adminLoginResponse.body.accessToken;

    const branchResponse = await request(app.getHttpServer())
      .post(`/api/v1/branches`)
      .set('Authorization', `Bearer ${merchantAdminToken}`)
      .send({
        name: `TTL Test Branch ${testSuffix}`,
        address: '456 TTL Avenue',
        contactName: 'TTL Branch Manager',
        contactPhone: '+1234567891',
      });

    branchId = branchResponse.body.id;

    const posResponse = await request(app.getHttpServer())
      .post(`/api/v1/pos`)
      .set('Authorization', `Bearer ${merchantAdminToken}`)
      .send({
        name: `TTL Test POS ${testSuffix}`,
        description: 'POS for TTL testing',
        branchId: branchId,
      });

    posId = posResponse.body.id;
  }, 30000);

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

  describe('TTL Expiration Tests', () => {
    it('should create payment order with correct TTL', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          amount: '25.00',
          description: 'TTL test order',
          posId: posId,
        })
        .expect(201);

      expect(response.body.status).toBe(PaymentOrderStatus.ACTIVE);
      expect(response.body.expiresAt).toBeDefined();

      const expiresAt = new Date(response.body.expiresAt);
      const now = new Date();
      const timeDiff = expiresAt.getTime() - now.getTime();

      // Should be approximately 10000ms (10 seconds) from test config (allow 2 second tolerance)
      expect(timeDiff).toBeGreaterThan(testConfig.paymentOrderTTL - 2000);
      expect(timeDiff).toBeLessThan(testConfig.paymentOrderTTL + 2000);
    });

    it('should expire payment order after TTL', async () => {
      // Create a payment order
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          amount: '50.00',
          description: 'Order to expire',
          posId: posId,
        });

      const orderId = createResponse.body.id;

      // Verify it's initially active
      await request(app.getHttpServer())
        .get(
          `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/current`,
        )
        .expect(200);

      // Wait for TTL to expire (plus buffer)
      await new Promise((resolve) =>
        setTimeout(resolve, testConfig.paymentOrderTTL + 2000),
      );

      // Verify it's now expired and not accessible via public endpoint
      await request(app.getHttpServer())
        .get(
          `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/current`,
        )
        .expect(404);

      // Verify the order status is EXPIRED in the database
      const expiredOrder = await paymentOrderRepository.findOne({
        where: { id: orderId },
      });
      expect(expiredOrder.status).toBe(PaymentOrderStatus.EXPIRED);
    }, 20000); // 20 seconds timeout

    it('should not allow processing expired orders', async () => {
      // Create and immediately expire an order
      const createResponse = await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          amount: '75.00',
          description: 'Order to expire immediately',
          posId: posId,
        });

      const orderId = createResponse.body.id;

      // Manually expire the order
      await paymentOrderRepository.update(
        { id: orderId },
        {
          expiresAt: new Date(Date.now() - 60000), // Expired 1 minute ago
        },
      );

      // Try to trigger in-progress (should fail)
      await request(app.getHttpServer())
        .post(
          `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/${orderId}/trigger-in-progress`,
        )
        .set('x-api-key', 'test-payment-api-key-12345')
        .expect(403);
    });

    it('should handle multiple orders and show only the latest active one', async () => {
      // Create first order
      const order1Response = await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          amount: '100.00',
          description: 'First order',
          posId: posId,
        });

      const order1Id = order1Response.body.id;

      // Create second order (should replace first one)
      const order2Response = await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          amount: '200.00',
          description: 'Second order',
          posId: posId,
        });

      const order2Id = order2Response.body.id;

      // Public endpoint should show the second order
      const publicResponse = await request(app.getHttpServer())
        .get(
          `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/current`,
        )
        .expect(200);

      expect(publicResponse.body.id).toBe(order2Id);
      expect(publicResponse.body.amount).toBe('200.00');

      // Wait for both orders to expire
      await new Promise((resolve) =>
        setTimeout(resolve, testConfig.paymentOrderTTL + 2000),
      );

      // Public endpoint should return 404
      await request(app.getHttpServer())
        .get(
          `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/current`,
        )
        .expect(404);
    }, 20000); // 20 seconds timeout

    it('should handle concurrent order creation correctly', async () => {
      // Create multiple orders rapidly
      const promises = Array.from({ length: 3 }, (_, i) =>
        request(app.getHttpServer())
          .post(`/api/v1/orders`)
          .set('Authorization', `Bearer ${merchantAdminToken}`)
          .send({
            amount: `${(i + 1) * 10}.00`,
            description: `Concurrent order ${i + 1}`,
            posId: posId,
          }),
      );

      const responses = await Promise.all(promises);

      // All should be created successfully
      responses.forEach((response) => {
        expect(response.status).toBe(201);
        // Due to queue logic, only one should be ACTIVE, others should be QUEUED
        expect([
          PaymentOrderStatus.ACTIVE,
          PaymentOrderStatus.QUEUED,
        ]).toContain(response.body.status);
      });

      // Public endpoint should show the last created order
      const publicResponse = await request(app.getHttpServer())
        .get(
          `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/current`,
        )
        .expect(200);

      // The last order could be any of the three due to concurrency, so check it's one of them
      const expectedAmounts = ['10.00', '20.00', '30.00'];
      expect(expectedAmounts).toContain(publicResponse.body.amount);
    });
  });

  describe('TTL Configuration Tests', () => {
    it('should respect different TTL values', async () => {
      // Test with a longer TTL
      const longTtl = 5000; // 5 seconds

      // Temporarily update the TTL by creating a new order with manual expiration
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchantAdminToken}`)
        .send({
          amount: '150.00',
          description: 'Long TTL test order',
          posId: posId,
        });

      const orderId = response.body.id;

      // Manually set a longer expiration
      await paymentOrderRepository.update(
        { id: orderId },
        { expiresAt: new Date(Date.now() + longTtl) },
      );

      // Should still be accessible after short TTL
      await new Promise((resolve) =>
        setTimeout(resolve, testConfig.paymentOrderTTL + 1000),
      );

      await request(app.getHttpServer())
        .get(
          `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/current`,
        )
        .expect(200);

      // Should expire after long TTL
      await new Promise((resolve) => setTimeout(resolve, longTtl + 1000));

      await request(app.getHttpServer())
        .get(
          `/api/v1/public/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders/current`,
        )
        .expect(404);
    }, 20000); // 20 seconds timeout
  });
});
