import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ConfigModule } from '@nestjs/config';

describe('Validation E2E Tests', () => {
  let app: INestApplication;
  let superadminToken: string;
  let merchantId: string;
  let branchId: string;
  let posId: string;
  const testSuffix = Date.now().toString();

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

    // Apply global ValidationPipe with enhanced error handling
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
          const logger = new Logger('ValidationPipe');
          logger.error('Validation failed:', errors);
          return new BadRequestException({
            message: 'Validation failed',
            errors: errors.map((error) => ({
              field: error.property,
              value: error.value,
              constraints: error.constraints,
            })),
            timestamp: new Date().toISOString(),
          });
        },
      }),
    );

    await app.init();

    // Login as superadmin
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'superadmin@zeppex.com',
        password: 'SuperAdmin!123',
      });

    superadminToken = loginResponse.body.accessToken;

    // Create test merchant
    const merchantResponse = await request(app.getHttpServer())
      .post('/api/v1/merchants')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        name: `Validation Test Merchant ${testSuffix}`,
        address: '123 Validation Street, Test City, TC 12345',
        contact: `contact.${testSuffix}@validationtest.com`,
        contactName: 'Validation Test',
        contactPhone: '+12345678901',
      });

    merchantId = merchantResponse.body.id;

    // Create test branch
    const branchResponse = await request(app.getHttpServer())
      .post(`/api/v1/merchants/${merchantId}/branches`)
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        name: 'Validation Test Branch',
        address: '456 Validation Avenue, Test Town, TT 67890',
        contactName: 'Branch Validation',
        contactPhone: '+12345678902',
      });

    branchId = branchResponse.body.id;

    // Create test POS
    const posResponse = await request(app.getHttpServer())
      .post(`/api/v1/merchants/${merchantId}/branches/${branchId}/pos`)
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        name: 'Validation Test POS',
        description: 'POS for validation testing',
      });

    posId = posResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Merchant Validation', () => {
    it('should reject merchant with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/merchants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: `Invalid Email Merchant ${testSuffix}`,
          address: '123 Test Street, Test City, TC 12345',
          contact: 'invalid-email',
          contactName: 'Test Contact',
          contactPhone: '+12345678903',
        })
        .expect(400);
    });

    it('should reject merchant with invalid phone number', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/merchants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: `Invalid Phone Merchant ${testSuffix}`,
          address: '123 Test Street, Test City, TC 12345',
          contact: `contact.${testSuffix}@test.com`,
          contactName: 'Test Contact',
          contactPhone: 'invalid-phone',
        })
        .expect(400);
    });

    it('should reject merchant with name too short', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/merchants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'A',
          address: '123 Test Street, Test City, TC 12345',
          contact: `contact.${testSuffix}@test.com`,
          contactName: 'Test Contact',
          contactPhone: '+12345678904',
        })
        .expect(400);
    });

    it('should reject merchant with name too long', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/merchants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'A'.repeat(101),
          address: '123 Test Street, Test City, TC 12345',
          contact: `contact.${testSuffix}@test.com`,
          contactName: 'Test Contact',
          contactPhone: '+12345678905',
        })
        .expect(400);
    });

    it('should reject merchant with address too short', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/merchants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: `Test Merchant ${testSuffix}`,
          address: '123',
          contact: `contact.${testSuffix}@test.com`,
          contactName: 'Test Contact',
          contactPhone: '+12345678906',
        })
        .expect(400);
    });

    it('should reject merchant with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/merchants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: `Test Merchant ${testSuffix}`,
          // Missing address, contact, contactName, contactPhone
        })
        .expect(400);
    });

    it('should accept valid merchant data', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/merchants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: `Valid Test Merchant ${testSuffix}`,
          address: '123 Valid Street, Valid City, VC 12345',
          contact: `contact.${testSuffix}@validtest.com`,
          contactName: 'Valid Contact',
          contactPhone: '+12345678907',
        })
        .expect(201);
    });
  });

  describe('Branch Validation', () => {
    it('should reject branch with invalid phone number', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/merchants/${merchantId}/branches`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: `Invalid Phone Branch ${testSuffix}`,
          address: '123 Test Street, Test City, TC 12345',
          contactName: 'Test Contact',
          contactPhone: 'invalid-phone',
        })
        .expect(400);
    });

    it('should reject branch with name too short', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/merchants/${merchantId}/branches`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'A',
          address: '123 Test Street, Test City, TC 12345',
          contactName: `Test Contact ${testSuffix}`,
          contactPhone: '+12345678908',
        })
        .expect(400);
    });

    it('should reject branch with name too long', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/merchants/${merchantId}/branches`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'A'.repeat(101),
          address: '123 Test Street, Test City, TC 12345',
          contactName: `Test Contact ${testSuffix}`,
          contactPhone: '+12345678909',
        })
        .expect(400);
    });

    it('should reject branch with missing required fields', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/merchants/${merchantId}/branches`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: `Test Branch ${testSuffix}`,
          // Missing address, contactName, contactPhone
        })
        .expect(400);
    });

    it('should accept valid branch data', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/merchants/${merchantId}/branches`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: `Valid Test Branch ${testSuffix}`,
          address: '123 Valid Street, Valid City, VC 12345',
          contactName: `Valid Contact ${testSuffix}`,
          contactPhone: '+12345678910',
        })
        .expect(201);
    });
  });

  describe('POS Validation', () => {
    it('should reject POS with name too long', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/merchants/${merchantId}/branches/${branchId}/pos`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'A'.repeat(101),
          description: `Test description ${testSuffix}`,
        })
        .expect(400);
    });

    it('should reject POS with description too long', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/merchants/${merchantId}/branches/${branchId}/pos`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: `Test POS ${testSuffix}`,
          description: 'A'.repeat(501),
        })
        .expect(400);
    });

    it('should reject POS with missing required fields', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/merchants/${merchantId}/branches/${branchId}/pos`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: `Test POS ${testSuffix}`,
          // Missing description
        })
        .expect(400);
    });

    it('should accept valid POS data', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/merchants/${merchantId}/branches/${branchId}/pos`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: `Valid Test POS ${testSuffix}`,
          description: `Valid POS description ${testSuffix}`,
        })
        .expect(201);
    });
  });

  describe('Payment Order Validation', () => {
    it('should reject payment order with invalid amount format', async () => {
      await request(app.getHttpServer())
        .post(
          `/api/v1/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders`,
        )
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          amount: 'invalid-amount',
          description: 'Test order',
        })
        .expect(400);
    });

    it('should reject payment order with amount too many decimal places', async () => {
      await request(app.getHttpServer())
        .post(
          `/api/v1/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders`,
        )
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          amount: '10.123',
          description: 'Test order',
        })
        .expect(400);
    });

    it('should reject payment order with description too long', async () => {
      await request(app.getHttpServer())
        .post(
          `/api/v1/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders`,
        )
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          amount: '10.00',
          description: 'A'.repeat(501),
        })
        .expect(400);
    });

    it('should reject payment order with missing required fields', async () => {
      await request(app.getHttpServer())
        .post(
          `/api/v1/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders`,
        )
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          amount: '10.00',
          // Missing description
        })
        .expect(400);
    });

    it('should accept valid payment order data', async () => {
      await request(app.getHttpServer())
        .post(
          `/api/v1/merchants/${merchantId}/branches/${branchId}/pos/${posId}/orders`,
        )
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          amount: '10.50',
          description: 'Valid test order',
        })
        .expect(201);
    });
  });

  describe('User Validation', () => {
    it('should reject user with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          email: 'invalid-email',
          password: 'ValidPassword!123',
          firstName: `Test ${testSuffix}`,
          lastName: 'User',
          role: 'admin',
          merchantId: merchantId,
        })
        .expect(400);
    });

    it('should reject user with invalid role', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          email: `test.${testSuffix}@example.com`,
          password: 'ValidPassword!123',
          firstName: `Test ${testSuffix}`,
          lastName: 'User',
          role: 'invalid-role',
          merchantId: merchantId,
        })
        .expect(400);
    });

    it('should reject user with invalid UUID for merchantId', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          email: `test.${testSuffix}@example.com`,
          password: 'ValidPassword!123',
          firstName: `Test ${testSuffix}`,
          lastName: 'User',
          role: 'admin',
          merchantId: 'invalid-uuid',
        })
        .expect(400);
    });

    it('should reject user with missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          email: `test.${testSuffix}@example.com`,
          // Missing password, firstName, lastName
          role: 'admin',
          merchantId: merchantId,
        })
        .expect(400);
    });

    it('should accept valid user data', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          email: `validuser.${testSuffix}@example.com`,
          password: 'ValidPassword!123',
          firstName: `Valid ${testSuffix}`,
          lastName: 'User',
          role: 'admin',
          merchantId: merchantId,
        })
        .expect(201);
    });
  });

  describe('Authentication Validation', () => {
    it('should reject login with invalid email format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: 'ValidPassword!123',
        })
        .expect(401);
    });

    it('should reject login with missing email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          password: 'ValidPassword!123',
        })
        .expect(401);
    });

    it('should reject login with missing password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: `test.${testSuffix}@example.com`,
        })
        .expect(401);
    });

    it('should reject refresh token with invalid token format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'invalid-token-format',
        })
        .expect(401);
    });
  });

  describe('Update DTO Validation', () => {
    let testMerchantId: string;
    let testBranchId: string;
    let testPosId: string;

    beforeAll(async () => {
      // Create test data for update validation
      const merchantResponse = await request(app.getHttpServer())
        .post('/api/v1/merchants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: `Update Test Merchant ${testSuffix}`,
          address: '123 Update Street, Test City, TC 12345',
          contact: `contact.${testSuffix}@updatetest.com`,
          contactName: 'Update Test',
          contactPhone: '+12345678911',
        });

      testMerchantId = merchantResponse.body.id;

      const branchResponse = await request(app.getHttpServer())
        .post(`/api/v1/merchants/${testMerchantId}/branches`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: `Update Test Branch ${testSuffix}`,
          address: '456 Update Avenue, Test Town, TT 67890',
          contactName: `Update Branch ${testSuffix}`,
          contactPhone: '+12345678912',
        });

      testBranchId = branchResponse.body.id;

      const posResponse = await request(app.getHttpServer())
        .post(
          `/api/v1/merchants/${testMerchantId}/branches/${testBranchId}/pos`,
        )
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: `Update Test POS ${testSuffix}`,
          description: `POS for update testing ${testSuffix}`,
        });

      testPosId = posResponse.body.id;
    });

    it('should accept partial merchant update with valid data', async () => {
      await request(app.getHttpServer())
        .put(`/api/v1/merchants/${testMerchantId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'Updated Merchant Name',
        })
        .expect(200);
    });

    it('should reject merchant update with invalid email', async () => {
      await request(app.getHttpServer())
        .put(`/api/v1/merchants/${testMerchantId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          contact: 'invalid-email',
        })
        .expect(400);
    });

    it('should accept partial branch update with valid data', async () => {
      await request(app.getHttpServer())
        .put(`/api/v1/merchants/${testMerchantId}/branches/${testBranchId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'Updated Branch Name',
        })
        .expect(200);
    });

    it('should reject branch update with invalid phone', async () => {
      await request(app.getHttpServer())
        .put(`/api/v1/merchants/${testMerchantId}/branches/${testBranchId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          contactPhone: 'invalid-phone',
        })
        .expect(400);
    });

    it('should accept partial POS update with valid data', async () => {
      await request(app.getHttpServer())
        .put(
          `/api/v1/merchants/${testMerchantId}/branches/${testBranchId}/pos/${testPosId}`,
        )
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'Updated POS Name',
        })
        .expect(200);
    });

    it('should accept partial payment order update with valid data', async () => {
      // Create a fresh payment order right before the test to avoid TTL issues
      const orderResponse = await request(app.getHttpServer())
        .post(
          `/api/v1/merchants/${testMerchantId}/branches/${testBranchId}/pos/${testPosId}/orders`,
        )
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          amount: '20.00',
          description: `Update test order ${testSuffix}`,
        });

      const orderId = orderResponse.body.id;

      await request(app.getHttpServer())
        .put(
          `/api/v1/merchants/${testMerchantId}/branches/${testBranchId}/pos/${testPosId}/orders/${orderId}`,
        )
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          amount: '25.50',
        })
        .expect(200);
    });

    it('should reject payment order update with invalid amount', async () => {
      // Create a fresh payment order right before the test to avoid TTL issues
      const orderResponse = await request(app.getHttpServer())
        .post(
          `/api/v1/merchants/${testMerchantId}/branches/${testBranchId}/pos/${testPosId}/orders`,
        )
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          amount: '20.00',
          description: `Update test order ${testSuffix}`,
        });

      const orderId = orderResponse.body.id;

      await request(app.getHttpServer())
        .put(
          `/api/v1/merchants/${testMerchantId}/branches/${testBranchId}/pos/${testPosId}/orders/${orderId}`,
        )
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          amount: 'invalid-amount',
        })
        .expect(400);
    });
  });
});
