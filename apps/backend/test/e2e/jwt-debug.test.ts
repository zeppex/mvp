import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { ConfigModule } from '@nestjs/config';

describe('JWT Debug Tests', () => {
  let app: INestApplication;
  let accessToken: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication Debug', () => {
    it('should login and get token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'superadmin@zeppex.com',
          password: 'SuperAdmin!123',
        })
        .expect(201);

      accessToken = response.body.accessToken;

      expect(accessToken).toBeDefined();
    });

    it('should access protected endpoint with token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/merchants')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should create merchant with token', async () => {
      const testSuffix = Math.random().toString(36).substring(2, 8);
      const response = await request(app.getHttpServer())
        .post('/api/v1/merchants')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: `Test Merchant ${testSuffix}`,
          address: '123 Test Street, Test City, TC 12345',
          contact: `contact.${testSuffix}@testmerchant.com`,
          contactName: 'Test Contact',
          contactPhone: '+12345678901',
        })
        .expect(201);
    });
  });
});
