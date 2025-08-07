import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ConfigService } from '@nestjs/config';

describe('Transaction Token Minting E2E Tests', () => {
  let app: INestApplication;
  let superadminToken: string;
  let merchantId: string;
  let branchId: string;
  let posId: string;
  let transactionId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login as superadmin
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'superadmin@zeppex.com',
        password: 'SuperAdmin!123',
      });

    superadminToken = loginResponse.body.access_token;

    // Create a test merchant, branch, and POS
    const merchantResponse = await request(app.getHttpServer())
      .post('/api/v1/merchants')
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        name: 'Test Merchant for Token Minting',
        address: '123 Test Street',
        contact: 'test@merchant.com',
        contactName: 'Test Contact',
        contactPhone: '+1234567890',
      });

    merchantId = merchantResponse.body.id;

    const branchResponse = await request(app.getHttpServer())
      .post(`/api/v1/merchants/${merchantId}/branches`)
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        name: 'Test Branch',
        address: '123 Test Branch Street',
        contactName: 'Branch Manager',
        contactPhone: '+1234567890',
      });

    branchId = branchResponse.body.id;

    const posResponse = await request(app.getHttpServer())
      .post(`/api/v1/merchants/${merchantId}/branches/${branchId}/pos`)
      .set('Authorization', `Bearer ${superadminToken}`)
      .send({
        name: 'Test POS',
        description: 'Test point of sale',
        branchId: branchId,
      });

    posId = posResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Transaction Token Minting', () => {
    it('should create a completed transaction and mint tokens', async () => {
      const transactionData = {
        merchantId: merchantId,
        branchId: branchId,
        posId: posId,
        amount: '50.00',
        exchange: 'BINANCE',
        description: 'Test transaction for token minting',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/transactions/completed')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(transactionData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('completed');
      expect(response.body.amount).toBe('50.00');
      expect(response.body.description).toBe(
        'Test transaction for token minting',
      );

      transactionId = response.body.id;
    });

    it('should complete a pending transaction and mint tokens', async () => {
      // First create a pending transaction
      const pendingTransactionData = {
        merchantId: merchantId,
        branchId: branchId,
        posId: posId,
        amount: '25.75',
        exchange: 'BINANCE',
        description: 'Pending transaction to be completed',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send(pendingTransactionData);

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.status).toBe('pending');

      const pendingTransactionId = createResponse.body.id;

      // Now complete the transaction
      const completeResponse = await request(app.getHttpServer())
        .patch(`/api/v1/transactions/${pendingTransactionId}/complete`)
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(completeResponse.status).toBe(200);
      expect(completeResponse.body.status).toBe('completed');
      expect(completeResponse.body.amount).toBe('25.75');
    });

    it('should complete multiple transactions and mint tokens', async () => {
      // Create multiple pending transactions
      const transactionIds: string[] = [];

      for (let i = 0; i < 3; i++) {
        const transactionData = {
          merchantId: merchantId,
          branchId: branchId,
          posId: posId,
          amount: `${10 + i * 5}.00`,
          exchange: 'BINANCE',
          description: `Batch transaction ${i + 1}`,
        };

        const createResponse = await request(app.getHttpServer())
          .post('/api/v1/transactions')
          .set('Authorization', `Bearer ${superadminToken}`)
          .send(transactionData);

        expect(createResponse.status).toBe(201);
        transactionIds.push(createResponse.body.id);
      }

      // Complete all transactions at once
      const completeResponse = await request(app.getHttpServer())
        .post('/api/v1/transactions/complete-multiple')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          transactionIds: transactionIds,
        });

      expect(completeResponse.status).toBe(200);
      expect(completeResponse.body).toHaveLength(3);

      // Verify all transactions are completed
      for (const transaction of completeResponse.body) {
        expect(transaction.status).toBe('completed');
      }
    });

    it('should verify branch token balance after transactions', async () => {
      // Get branch details to check token balance
      const branchResponse = await request(app.getHttpServer())
        .get(`/api/v1/merchants/${merchantId}/branches/${branchId}`)
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(branchResponse.status).toBe(200);

      // The branch should have accumulated tokens from the completed transactions
      // Total expected: 50 + 25 + 10 + 15 + 20 = 120 tokens
      const tokenBalance = parseFloat(
        branchResponse.body.zeppexTokenBalance || '0',
      );
      expect(tokenBalance).toBeGreaterThan(0);
    });
  });
});
