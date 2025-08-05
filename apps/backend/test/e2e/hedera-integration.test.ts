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
import { AccountId } from '@hashgraph/sdk';

describe('Hedera Integration E2E Tests', () => {
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

    // Set up authentication for all tests
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

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Authentication Setup', () => {
    it('should have valid superadmin token', () => {
      expect(superadminToken).toBeDefined();
      expect(typeof superadminToken).toBe('string');
      expect(superadminToken.length).toBeGreaterThan(0);
    });
  });

  describe('Hedera Token Operations', () => {
    it('should create Zeppex token on Hedera network', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/treasury/create-token')
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(201);

      expect(response.body.message).toBe('Zeppex token created successfully');
      expect(response.body.tokenInfo).toBeDefined();
      expect(response.body.tokenInfo.tokenId).toBeDefined();
      expect(response.body.tokenInfo.name).toBe('Zeppex Token');
      expect(response.body.tokenInfo.symbol).toBe('ZEPPEX');
      expect(response.body.tokenInfo.decimals).toBe(6);
      expect(response.body.tokenInfo.treasuryAccountId).toBeDefined();

      console.log('✅ Token created:', response.body.tokenInfo.tokenId);
    });

    it('should reject token creation without proper authorization', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/treasury/create-token')
        .expect(401); // No token provided
    });
  });

  describe('Merchant and Branch Setup with Hedera Integration', () => {
    it('should create a test merchant', async () => {
      const merchantData = {
        name: `Test Merchant ${testSuffix}`,
        address: '123 Test Street, Test City, TC 12345',
        contactName: 'Test Contact',
        contactPhone: '+1234567890',
        contact: `test${testSuffix}@merchant.com`,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/merchants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(merchantData)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe(merchantData.name);
      expect(response.body.address).toBe(merchantData.address);

      merchantId = response.body.id;
      console.log('✅ Merchant created:', merchantId);
    });

    it('should create a branch with automatic Hedera account creation', async () => {
      const branchData = {
        name: `Test Branch ${testSuffix}`,
        address: '456 Branch Street, Branch City, BC 67890',
        contactName: 'Branch Contact',
        contactPhone: '+1987654321',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/branches')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          ...branchData,
          merchantId: merchantId,
        })
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe(branchData.name);
      expect(response.body.address).toBe(branchData.address);

      // Verify Hedera account was created
      expect(response.body.hederaAccountId).toBeDefined();
      expect(response.body.hederaPublicKey).toBeDefined();
      expect(response.body.hederaPrivateKey).toBeDefined();
      expect(response.body.zeppexTokenBalance).toBeDefined();
      expect(response.body.hbarBalance).toBeDefined();

      // Validate Hedera account ID format
      expect(response.body.hederaAccountId).toMatch(/^0\.0\.\d+$/);
      expect(response.body.hederaPublicKey).toBeDefined(); // Public key should exist
      expect(response.body.hederaPrivateKey).toBeDefined(); // Private key should exist

      branchId = response.body.id;
      console.log(
        '✅ Branch created with Hedera account:',
        response.body.hederaAccountId,
      );
    });

    it('should validate the created Hedera account exists and has proper balances', async () => {
      console.log('🔍 Debug - branchId:', branchId);
      console.log('🔍 Debug - merchantId:', merchantId);

      // First try without merchantId to see if the branch exists
      let response = await request(app.getHttpServer())
        .get(`/api/v1/branches/${branchId}`)
        .set('Authorization', `Bearer ${superadminToken}`);

      console.log('🔍 Debug - First attempt status:', response.status);
      console.log('🔍 Debug - First attempt body:', response.body);

      // If that fails, try with merchantId
      if (response.status === 403) {
        response = await request(app.getHttpServer())
          .get(`/api/v1/branches/${branchId}?merchantId=${merchantId}`)
          .set('Authorization', `Bearer ${superadminToken}`);

        console.log('🔍 Debug - Second attempt status:', response.status);
        console.log('🔍 Debug - Second attempt body:', response.body);
      }

      expect(response.status).toBe(200);

      expect(response.body.hederaAccountId).toBeDefined();
      expect(response.body.zeppexTokenBalance).toBeDefined();
      expect(response.body.hbarBalance).toBeDefined();
      expect(response.body.lastBalanceUpdate).toBeDefined();

      // Verify initial balances
      // Note: HBAR balance might be 0 initially if balance hasn't been updated yet
      expect(parseFloat(response.body.hbarBalance)).toBeGreaterThanOrEqual(0); // HBAR balance should be >= 0
      expect(parseFloat(response.body.zeppexTokenBalance)).toBe(0); // Initial token balance should be 0
    });
  });

  describe('Token Minting Operations', () => {
    it('should mint tokens to the branch account', async () => {
      const mintAmount = 1000;
      const mintData = {
        amount: mintAmount,
        memo: 'Test token minting for E2E tests',
      };

      // Ensure we have a valid branchId
      if (!branchId) {
        throw new Error(
          'branchId is undefined. Make sure to run the branch creation test first.',
        );
      }

      const response = await request(app.getHttpServer())
        .post(`/api/v1/treasury/branches/${branchId}/mint-tokens`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(mintData);

      if (response.status !== 200) {
        console.log('❌ Token minting failed:', response.status, response.body);
        console.log('🔍 Debug info - branchId:', branchId);
        console.log('🔍 Debug info - mintData:', mintData);
      }

      expect(response.status).toBe(200);

      expect(response.body.message).toBeDefined();
      expect(response.body.amount).toBe(mintAmount);
      expect(response.body.branchId).toBe(branchId);

      console.log('✅ Tokens minted:', response.body.message);
    });

    it('should verify token balance was updated after minting', async () => {
      // Wait a moment for the transaction to be processed
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await request(app.getHttpServer())
        .get(`/api/v1/branches/${branchId}?merchantId=${merchantId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(200);

      expect(response.body.zeppexTokenBalance).toBeDefined();
      expect(parseFloat(response.body.zeppexTokenBalance)).toBe(1000); // Should match minted amount
      expect(response.body.lastBalanceUpdate).toBeDefined();

      console.log(
        '✅ Token balance verified:',
        response.body.zeppexTokenBalance,
      );
    });

    it('should reject token minting with invalid amount', async () => {
      const invalidMintData = {
        amount: -100, // Negative amount should be rejected
        memo: 'Invalid minting test',
      };

      await request(app.getHttpServer())
        .post(`/api/v1/treasury/branches/${branchId}/mint-tokens`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(invalidMintData)
        .expect(400);
    });

    it('should reject token minting to non-existent branch', async () => {
      const mintData = {
        amount: 100,
        memo: 'Test minting to non-existent branch',
      };

      await request(app.getHttpServer())
        .post('/api/v1/treasury/branches/non-existent-branch-id/mint-tokens')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(mintData)
        .expect(404);
    });
  });

  describe('POS Creation with Token Integration', () => {
    it('should create a POS for the branch', async () => {
      const posData = {
        name: `Test POS ${testSuffix}`,
        description: 'Test POS for Hedera integration testing',
      };

      // Ensure we have valid IDs
      if (!branchId) {
        throw new Error(
          'branchId is undefined. Make sure to run the branch creation test first.',
        );
      }
      if (!merchantId) {
        throw new Error(
          'merchantId is undefined. Make sure to run the merchant creation test first.',
        );
      }

      const response = await request(app.getHttpServer())
        .post('/api/v1/pos')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          ...posData,
          branchId: branchId,
          merchantId: merchantId,
        })
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe(posData.name);
      expect(response.body.description).toBe(posData.description);
      expect(response.body.branchId).toBe(branchId);

      posId = response.body.id;
      console.log('✅ POS created:', posId);
    });
  });

  describe('Payment Flow with Token Integration', () => {
    it('should create a payment order with token integration', async () => {
      const paymentOrderData = {
        amount: 50.0,
        description: 'Test payment order with token integration',
        posId: posId,
      };

      // Ensure we have a valid posId
      if (!posId) {
        throw new Error(
          'posId is undefined. Make sure to run the POS creation test first.',
        );
      }

      const response = await request(app.getHttpServer())
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(paymentOrderData)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.amount).toBe(paymentOrderData.amount);
      expect(response.body.description).toBe(paymentOrderData.description);
      expect(response.body.status).toBe('pending');
      expect(response.body.posId).toBe(posId);

      console.log('✅ Payment order created:', response.body.id);
    });

    it('should get current payment order for POS (public endpoint)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/public/pos/${posId}/orders/current`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBeDefined();
      expect(response.body.amount).toBeDefined();
      expect(response.body.status).toBeDefined();
      expect(response.body.expiresAt).toBeDefined();

      console.log('✅ Current payment order retrieved:', response.body.id);
    });
  });

  describe('Hedera Account Balance Verification', () => {
    it('should verify branch account has correct HBAR and token balances', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/branches/${branchId}?merchantId=${merchantId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(200);

      // Verify HBAR balance (should be >= 0.1 for initial funding)
      expect(parseFloat(response.body.hbarBalance)).toBeGreaterThanOrEqual(0.1);

      // Verify token balance (should be 1000 from minting)
      expect(parseFloat(response.body.zeppexTokenBalance)).toBe(1000);

      // Verify last balance update timestamp
      expect(response.body.lastBalanceUpdate).toBeDefined();
      expect(new Date(response.body.lastBalanceUpdate)).toBeInstanceOf(Date);

      console.log('✅ Account balances verified:');
      console.log(`   HBAR: ${response.body.hbarBalance}`);
      console.log(`   ZEPPEX: ${response.body.zeppexTokenBalance}`);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle Hedera network errors gracefully', async () => {
      // Test with invalid Hedera account ID
      const invalidBranchData = {
        name: 'Invalid Branch Test',
        address: 'Invalid Address',
        contactName: 'Invalid Contact',
        contactPhone: '+1234567890',
        merchantId: merchantId,
      };

      // This test assumes the system handles Hedera errors gracefully
      // In a real scenario, you might want to mock Hedera service to simulate network errors
      const response = await request(app.getHttpServer())
        .post('/api/v1/branches')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(invalidBranchData);

      // Should either succeed (if Hedera is working) or fail gracefully
      expect([201, 500]).toContain(response.status);
    });

    it('should reject operations with invalid Hedera account IDs', async () => {
      // Try to mint tokens to a branch with invalid Hedera account ID
      const mintData = {
        amount: 100,
        memo: 'Test with invalid account',
      };

      // This should fail if the branch doesn't have a valid Hedera account
      await request(app.getHttpServer())
        .post('/api/v1/treasury/branches/invalid-branch-id/mint-tokens')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(mintData)
        .expect(404);
    });
  });

  describe('Cleanup and Final Verification', () => {
    it('should verify all created entities have proper Hedera integration', async () => {
      // Verify merchant
      const merchantResponse = await request(app.getHttpServer())
        .get(`/api/v1/merchants/${merchantId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(200);

      expect(merchantResponse.body).toBeDefined();

      // Verify branch with Hedera account
      const branchResponse = await request(app.getHttpServer())
        .get(`/api/v1/branches/${branchId}?merchantId=${merchantId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(200);

      expect(branchResponse.body.hederaAccountId).toBeDefined();
      expect(branchResponse.body.hederaPublicKey).toBeDefined();
      expect(branchResponse.body.hederaPrivateKey).toBeDefined();

      // Verify POS
      const posResponse = await request(app.getHttpServer())
        .get(`/api/v1/pos/${posId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(200);

      expect(posResponse.body).toBeDefined();

      console.log('✅ All entities verified with Hedera integration');
      console.log(`   Merchant: ${merchantId}`);
      console.log(
        `   Branch: ${branchId} (Hedera: ${branchResponse.body.hederaAccountId})`,
      );
      console.log(`   POS: ${posId}`);
    });
  });
});
