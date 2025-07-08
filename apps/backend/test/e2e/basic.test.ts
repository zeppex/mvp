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

describe('Basic E2E Tests', () => {
  let app: INestApplication;
  let superadminToken: string;
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });
  });

  describe('Authentication', () => {
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
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('superadmin@zeppex.com');
    });

    it('should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'superadmin@zeppex.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('Merchant Management', () => {
    let merchantId: string;

    it('should create a merchant', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/merchants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: `Test Coffee Shop ${testSuffix}`,
          address: '123 Coffee Street, Brew City, BC 12345',
          contact: `contact.${testSuffix}@testcoffee.com`,
          contactName: 'John Coffee',
          contactPhone: '+1234567890',
        })
        .expect(201);

      merchantId = response.body.id;
      expect(response.body.name).toBe(`Test Coffee Shop ${testSuffix}`);
      expect(response.body.contact).toBe(
        `contact.${testSuffix}@testcoffee.com`,
      );
    });

    it('should retrieve the created merchant', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/merchants/${merchantId}`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(200);

      expect(response.body.id).toBe(merchantId);
      expect(response.body.name).toBe(`Test Coffee Shop ${testSuffix}`);
    });

    it('should list all merchants', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/merchants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Data Validation', () => {
    it('should reject merchant with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/merchants')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: `Invalid Email Merchant ${testSuffix}`,
          address: '123 Test Street, Test City, TC 12345',
          contact: 'invalid-email',
          contactName: 'Test Contact',
          contactPhone: '+1234567890',
        })
        .expect(400);
    });

    it('should reject merchant with invalid phone', async () => {
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
  });
});
