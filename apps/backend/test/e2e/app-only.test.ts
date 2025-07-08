import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';

describe('App Only E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('App Root', () => {
    it('should return hello world', async () => {
      const response = await request(app.getHttpServer()).get('/').expect(200);

      expect(response.text).toBe('Hello World!');
    });
  });
});
