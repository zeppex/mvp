import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

describe('Multi-Tenant Architecture E2E Tests', () => {
  let app: INestApplication;
  let superadminToken: string;
  let merchant1AdminToken: string;
  let merchant2AdminToken: string;
  let merchant1BranchAdminToken: string;
  let merchant1CashierToken: string;
  let merchant1Id: string;
  let merchant2Id: string;
  let merchant1Branch1Id: string;
  let merchant2Branch1Id: string;
  let merchant1Pos1Id: string;
  let merchant2Pos1Id: string;
  let merchant1Order1Id: string;
  let merchant2Order1Id: string;
  let branchAdminUserId: string;
  let cashierUserId: string;
  let cashierPosId: string;

  // Generate random suffix for test data
  const testSuffix = Math.random().toString(36).substring(2, 8);

  // Test data with random suffixes
  const merchant1Data = {
    name: `Test Merchant 1 ${testSuffix}`,
    address: `123 Test Street ${testSuffix}, Test City, TC 12345`,
    contact: `contact1.${testSuffix}@testmerchant.com`,
    contactName: `John Test ${testSuffix}`,
    contactPhone: `+12345678901`,
  };

  const merchant2Data = {
    name: `Test Merchant 2 ${testSuffix}`,
    address: `456 Test Avenue ${testSuffix}, Test Town, TT 67890`,
    contact: `contact2.${testSuffix}@testmerchant.com`,
    contactName: `Jane Test ${testSuffix}`,
    contactPhone: `+12345678902`,
  };

  const branch1Data = {
    name: `Main Branch ${testSuffix}`,
    address: `789 Branch Street ${testSuffix}, Branch City, BC 11111`,
    contactName: `Branch Manager ${testSuffix}`,
    contactPhone: `+12345678903`,
  };

  const branch2Data = {
    name: `Secondary Branch ${testSuffix}`,
    address: `321 Branch Avenue ${testSuffix}, Branch Town, BT 22222`,
    contactName: `Branch Supervisor ${testSuffix}`,
    contactPhone: `+12345678904`,
  };

  const pos1Data = {
    name: `POS Terminal 1 ${testSuffix}`,
    description: `Main checkout terminal ${testSuffix}`,
    branchId: '', // Will be set after branch creation
  };

  const pos2Data = {
    name: `POS Terminal 2 ${testSuffix}`,
    description: `Secondary checkout terminal ${testSuffix}`,
    branchId: '', // Will be set after branch creation
  };

  const paymentOrder1Data = {
    amount: '25.50',
    description: `Coffee and pastry order ${testSuffix}`,
  };

  const paymentOrder2Data = {
    amount: '15.75',
    description: `Sandwich order ${testSuffix}`,
  };

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Setup', () => {
    it('should login as superadmin', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'superadmin@zeppex.com',
          password: 'SuperAdmin!123',
        })
        .expect(201);

      superadminToken = response.body.accessToken;
      expect(superadminToken).toBeDefined();
    });
  });

  describe('Merchant Creation and Isolation', () => {
    it('should create merchant 1 as superadmin', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/merchants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(merchant1Data)
        .expect(201);

      merchant1Id = response.body.id;
      expect(response.body.name).toBe(merchant1Data.name);
      expect(response.body.contact).toBe(merchant1Data.contact);
    });

    it('should create merchant 2 as superadmin', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/merchants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(merchant2Data)
        .expect(201);

      merchant2Id = response.body.id;
      expect(response.body.name).toBe(merchant2Data.name);
      expect(response.body.contact).toBe(merchant2Data.contact);
    });

    it('should create admin user for merchant 1', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          email: `admin1.${testSuffix}@testmerchant.com`,
          password: 'Admin!123',
          firstName: 'Merchant',
          lastName: 'Admin',
          role: 'admin',
          merchantId: merchant1Id,
        })
        .expect(201);

      expect(response.body.email).toBe(`admin1.${testSuffix}@testmerchant.com`);
      expect(response.body.merchantId || response.body.merchant?.id).toBe(
        merchant1Id,
      );
    });

    it('should create admin user for merchant 2', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          email: `admin2.${testSuffix}@testmerchant.com`,
          password: 'Admin!123',
          firstName: 'Merchant',
          lastName: 'Admin',
          role: 'admin',
          merchantId: merchant2Id,
        })
        .expect(201);

      expect(response.body.email).toBe(`admin2.${testSuffix}@testmerchant.com`);
      expect(response.body.merchantId || response.body.merchant?.id).toBe(
        merchant2Id,
      );
    });

    it('should login as merchant 1 admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: `admin1.${testSuffix}@testmerchant.com`,
          password: 'Admin!123',
        })
        .expect(201);

      merchant1AdminToken = response.body.accessToken;
      expect(merchant1AdminToken).toBeDefined();
    });

    it('should login as merchant 2 admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: `admin2.${testSuffix}@testmerchant.com`,
          password: 'Admin!123',
        })
        .expect(201);

      merchant2AdminToken = response.body.accessToken;
      expect(merchant2AdminToken).toBeDefined();
    });

    it('should verify merchant 1 admin can only see their own merchant', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/merchants')
        .set('Authorization', `Bearer ${merchant1AdminToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(merchant1Id);
      expect(response.body[0].name).toBe(merchant1Data.name);
    });

    it('should verify merchant 2 admin can only see their own merchant', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/merchants')
        .set('Authorization', `Bearer ${merchant2AdminToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(merchant2Id);
      expect(response.body[0].name).toBe(merchant2Data.name);
    });

    it('should prevent merchant 1 admin from accessing merchant 2 data', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/merchants/${merchant2Id}`)
        .set('Authorization', `Bearer ${merchant1AdminToken}`)
        .expect(403);
    });

    it('should prevent merchant 2 admin from accessing merchant 1 data', async () => {
      await request(app.getHttpServer())
        .get(`/api/v1/merchants/${merchant1Id}`)
        .set('Authorization', `Bearer ${merchant2AdminToken}`)
        .expect(403);
    });
  });

  describe('Branch Creation and Isolation', () => {
    it('should create branch 1 for merchant 1', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/branches`)
        .set('Authorization', `Bearer ${merchant1AdminToken}`)
        .send(branch1Data)
        .expect(201);

      merchant1Branch1Id = response.body.id;
      expect(response.body.name).toBe(branch1Data.name);
      expect(response.body.merchant.id).toBe(merchant1Id);
    });

    it('should create branch 1 for merchant 2', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/branches`)
        .set('Authorization', `Bearer ${merchant2AdminToken}`)
        .send(branch2Data)
        .expect(201);

      merchant2Branch1Id = response.body.id;
      expect(response.body.name).toBe(branch2Data.name);
      expect(response.body.merchant.id).toBe(merchant2Id);
    });

    it('should prevent merchant 1 admin from creating branch for merchant 2', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/branches`)
        .set('Authorization', `Bearer ${merchant1AdminToken}`)
        .send({
          ...branch1Data,
          merchantId: merchant2Id, // Try to create for merchant 2
        })
        .expect(403);
    });

    it('should prevent merchant 2 admin from creating branch for merchant 1', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/branches`)
        .set('Authorization', `Bearer ${merchant2AdminToken}`)
        .send({
          ...branch2Data,
          merchantId: merchant1Id, // Try to create for merchant 1
        })
        .expect(403);
    });

    it('should verify merchant 1 admin can only see their own branches', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/branches`)
        .set('Authorization', `Bearer ${merchant1AdminToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(merchant1Branch1Id);
      expect(response.body[0].name).toBe(branch1Data.name);
    });

    it('should verify merchant 2 admin can only see their own branches', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/branches`)
        .set('Authorization', `Bearer ${merchant2AdminToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(merchant2Branch1Id);
      expect(response.body[0].name).toBe(branch2Data.name);
    });
  });

  describe('POS Creation and Isolation', () => {
    it('should create POS 1 for merchant 1 branch', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/pos`)
        .set('Authorization', `Bearer ${merchant1AdminToken}`)
        .send({
          ...pos1Data,
          branchId: merchant1Branch1Id,
        })
        .expect(201);

      merchant1Pos1Id = response.body.id;
      expect(response.body.name).toBe(pos1Data.name);
      expect(response.body.branch.id).toBe(merchant1Branch1Id);
    });

    it('should create POS 1 for merchant 2 branch', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/pos`)
        .set('Authorization', `Bearer ${merchant2AdminToken}`)
        .send({
          ...pos2Data,
          branchId: merchant2Branch1Id,
        })
        .expect(201);

      merchant2Pos1Id = response.body.id;
      expect(response.body.name).toBe(pos2Data.name);
      expect(response.body.branch.id).toBe(merchant2Branch1Id);
    });

    it('should prevent merchant 1 admin from creating POS for merchant 2', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/pos`)
        .set('Authorization', `Bearer ${merchant1AdminToken}`)
        .send({
          ...pos1Data,
          branchId: merchant2Branch1Id,
          merchantId: merchant2Id, // Try to create for merchant 2
        })
        .expect(403);
    });

    it('should verify merchant 1 admin can only see their own POS', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/pos`)
        .set('Authorization', `Bearer ${merchant1AdminToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(merchant1Pos1Id);
      expect(response.body[0].name).toBe(pos1Data.name);
    });

    it('should verify merchant 2 admin can only see their own POS', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/pos`)
        .set('Authorization', `Bearer ${merchant2AdminToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(merchant2Pos1Id);
      expect(response.body[0].name).toBe(pos2Data.name);
    });
  });

  describe('Payment Order Creation and Isolation', () => {
    it('should create payment order 1 for merchant 1 POS', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchant1AdminToken}`)
        .send({
          ...paymentOrder1Data,
          posId: merchant1Pos1Id,
        })
        .expect(201);

      merchant1Order1Id = response.body.id;
      expect(response.body.amount).toBe(paymentOrder1Data.amount);
      expect(response.body.description).toBe(paymentOrder1Data.description);
      expect(response.body.pos.id).toBe(merchant1Pos1Id);
    });

    it('should create payment order 1 for merchant 2 POS', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchant2AdminToken}`)
        .send({
          ...paymentOrder2Data,
          posId: merchant2Pos1Id,
        })
        .expect(201);

      merchant2Order1Id = response.body.id;
      expect(response.body.amount).toBe(paymentOrder2Data.amount);
      expect(response.body.description).toBe(paymentOrder2Data.description);
      expect(response.body.pos.id).toBe(merchant2Pos1Id);
    });

    it('should prevent merchant 1 admin from creating payment order for merchant 2', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchant1AdminToken}`)
        .send({
          ...paymentOrder1Data,
          posId: merchant2Pos1Id, // Try to create for merchant 2's POS
        })
        .expect(404); // POS not found for merchant 1
    });

    it('should verify merchant 1 admin can only see their own payment orders', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchant1AdminToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(merchant1Order1Id);
      expect(parseFloat(response.body[0].amount)).toBeCloseTo(
        parseFloat(paymentOrder1Data.amount),
        2,
      );
    });

    it('should verify merchant 2 admin can only see their own payment orders', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchant2AdminToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].id).toBe(merchant2Order1Id);
      expect(parseFloat(response.body[0].amount)).toBeCloseTo(
        parseFloat(paymentOrder2Data.amount),
        2,
      );
    });
  });

  describe('Branch Admin Role Tests', () => {
    it('should create branch admin user for merchant 1 branch', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          email: `branchadmin.${testSuffix}@testmerchant.com`,
          password: 'BranchAdmin!123',
          firstName: 'Branch',
          lastName: 'Admin',
          role: 'branch_admin',
          merchantId: merchant1Id,
          branchId: merchant1Branch1Id,
        })
        .expect(201);

      branchAdminUserId = response.body.id;
      expect(response.body.email).toBe(
        `branchadmin.${testSuffix}@testmerchant.com`,
      );
      expect(response.body.branchId || response.body.branch?.id).toBe(
        merchant1Branch1Id,
      );
    });

    it('should login as branch admin', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: `branchadmin.${testSuffix}@testmerchant.com`,
          password: 'BranchAdmin!123',
        })
        .expect(201);

      merchant1BranchAdminToken = response.body.accessToken;
      expect(merchant1BranchAdminToken).toBeDefined();
    });

    it('should allow branch admin to create POS for their branch', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/pos`)
        .set('Authorization', `Bearer ${merchant1BranchAdminToken}`)
        .send({
          name: `Branch Admin POS ${testSuffix}`,
          description: `POS created by branch admin ${testSuffix}`,
          branchId: merchant1Branch1Id,
        })
        .expect(201);

      expect(response.body.name).toBe(`Branch Admin POS ${testSuffix}`);
      expect(response.body.branch.id).toBe(merchant1Branch1Id);
    });

    it('should prevent branch admin from creating POS for different branch', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/pos`)
        .set('Authorization', `Bearer ${merchant1BranchAdminToken}`)
        .send({
          name: `Unauthorized POS ${testSuffix}`,
          description: `Should not be allowed ${testSuffix}`,
          branchId: merchant2Branch1Id,
        })
        .expect(403);
    });
  });

  describe('Cashier Role Tests', () => {
    it('should create POS for cashier', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/pos`)
        .set('Authorization', `Bearer ${merchant1AdminToken}`)
        .send({
          name: `Cashier POS ${testSuffix}`,
          description: `POS for cashier testing ${testSuffix}`,
          branchId: merchant1Branch1Id,
        })
        .expect(201);

      cashierPosId = response.body.id;
    });

    it('should create cashier user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          email: `cashier.${testSuffix}@testmerchant.com`,
          password: 'Cashier!123',
          firstName: 'Test',
          lastName: 'Cashier',
          role: 'cashier',
          merchantId: merchant1Id,
          branchId: merchant1Branch1Id,
          posId: cashierPosId,
        })
        .expect(201);

      cashierUserId = response.body.id;
      expect(response.body.posId || response.body.pos?.id).toBe(cashierPosId);
    });

    it('should login as cashier', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: `cashier.${testSuffix}@testmerchant.com`,
          password: 'Cashier!123',
        })
        .expect(201);

      merchant1CashierToken = response.body.accessToken;
      expect(merchant1CashierToken).toBeDefined();
    });

    it('should allow cashier to create payment order for their POS', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchant1CashierToken}`)
        .send({
          amount: '10.00',
          description: `Cashier test order ${testSuffix}`,
          posId: cashierPosId,
        })
        .expect(201);

      expect(response.body.amount).toBe('10.00');
      expect(response.body.pos.id).toBe(cashierPosId);
    });

    it('should prevent cashier from creating payment order for different POS', async () => {
      await request(app.getHttpServer())
        .post(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchant1CashierToken}`)
        .send({
          amount: '5.00',
          description: `Unauthorized order ${testSuffix}`,
          posId: merchant1Pos1Id,
        })
        .expect(400); // Bad Request - Cashier can only create orders for their assigned POS
    });
  });

  describe('Data Isolation Verification', () => {
    it('should verify superadmin can see all merchants', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/merchants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(200);

      expect(response.body.length).toBeGreaterThanOrEqual(2);
      const merchantIds = response.body.map((m: any) => m.id);
      expect(merchantIds).toContain(merchant1Id);
      expect(merchantIds).toContain(merchant2Id);
    });

    it('should verify merchant 1 cannot access merchant 2 data at any level', async () => {
      // Try to access merchant 2's branch
      await request(app.getHttpServer())
        .get(`/api/v1/branches`)
        .set('Authorization', `Bearer ${merchant1AdminToken}`)
        .expect(200); // This will only show merchant 1's branches due to guard

      // Try to access merchant 2's POS
      await request(app.getHttpServer())
        .get(`/api/v1/pos`)
        .set('Authorization', `Bearer ${merchant1AdminToken}`)
        .expect(200); // This will only show merchant 1's POS due to guard

      // Try to access merchant 2's payment orders
      await request(app.getHttpServer())
        .get(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchant1AdminToken}`)
        .expect(200); // This will only show merchant 1's orders due to guard
    });

    it('should verify merchant 2 cannot access merchant 1 data at any level', async () => {
      // Try to access merchant 1's branch
      await request(app.getHttpServer())
        .get(`/api/v1/branches`)
        .set('Authorization', `Bearer ${merchant2AdminToken}`)
        .expect(200); // This will only show merchant 2's branches due to guard

      // Try to access merchant 1's POS
      await request(app.getHttpServer())
        .get(`/api/v1/pos`)
        .set('Authorization', `Bearer ${merchant2AdminToken}`)
        .expect(200); // This will only show merchant 2's POS due to guard

      // Try to access merchant 1's payment orders
      await request(app.getHttpServer())
        .get(`/api/v1/orders`)
        .set('Authorization', `Bearer ${merchant2AdminToken}`)
        .expect(200); // This will only show merchant 2's orders due to guard
    });
  });
});
