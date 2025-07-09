import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../../src/app.module';

export const createTestingModule = async () => {
  return Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
        load: [
          () => ({
            // Override TTL for faster testing
            PAYMENT_ORDER_TTL: 30000, // 30 seconds for testing
            NODE_ENV: 'test',
            DB_HOST: process.env.DB_HOST || 'localhost',
            DB_PORT: parseInt(process.env.DB_PORT || '5432'),
            DB_USER: process.env.DB_USER || 'postgres',
            DB_PASS: process.env.DB_PASS || 'password',
            DB_NAME: process.env.DB_NAME || 'zeppex_test',
            JWT_SECRET:
              process.env.JWT_SECRET ||
              'test-secret-key-for-jwt-signing-32-chars',
            FRONTEND_URL: 'http://localhost:3000',
          }),
        ],
      }),
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'password',
        database: process.env.DB_NAME || 'zeppex_test',
        autoLoadEntities: true,
        synchronize: true, // Be careful with this in production
        logging: false,
        dropSchema: true, // Clean database for each test run
      }),
      AppModule,
    ],
  }).compile();
};

export const testConfig = {
  // Test-specific configuration
  paymentOrderTTL: 30000, // 30 seconds
  testTimeout: 60000, // 60 seconds
  cleanupDelay: 1000, // 1 second delay for cleanup operations

  // Test data
  testMerchant: {
    name: 'Test Payment Merchant',
    address: '123 Payment Street',
    contact: 'test@payment.com',
    contactName: 'Payment Tester',
    contactPhone: '+1234567890',
  },

  testBranch: {
    name: 'Test Payment Branch',
    address: '456 Payment Avenue',
    contactName: 'Branch Manager',
    contactPhone: '+1234567891',
  },

  testPos: {
    name: 'Test Payment POS',
    description: 'Test Point of Sale for Payment Flow',
  },

  testPaymentOrder: {
    amount: '99.99',
    description: 'Test payment order for E2E testing',
  },

  // Test user credentials
  testUser: {
    email: 'superadmin@zeppex.com',
    password: 'SuperAdmin!123',
  },
};

export const waitForExpiration = (ttl: number) => {
  return new Promise((resolve) => setTimeout(resolve, ttl + 1000)); // Add 1 second buffer
};

export const createExpiredDate = (minutesAgo: number = 1) => {
  return new Date(Date.now() - minutesAgo * 60 * 1000);
};

export const createFutureDate = (minutesFromNow: number = 1) => {
  return new Date(Date.now() + minutesFromNow * 60 * 1000);
};
