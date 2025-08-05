import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExchangeGwModule } from './exchange-gw/exchange-gw.module';
import { BinanceClientModule } from './binance-client/binance-client.module';
import { SharedModule } from './shared/shared.module';
import { QrCodeModule } from './shared/qr-code.module';
import { CleanupModule } from './shared/cleanup.module';
import { SeedModule } from './shared/seed.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from './core/core.module';
import { PaymentOrderModule } from './core/payment-order.module';
import { TransactionModule } from './transactions/transaction.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { HederaModule } from './hedera/hedera.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(4000),
        FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),

        // Database configuration
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USER: Joi.string().required(),
        DB_PASS: Joi.string().required(),
        DB_NAME: Joi.string().required(),

        // JWT configuration
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.string().default('15m'),
        JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('7d'),

        // Payment order configuration
        PAYMENT_ORDER_TTL: Joi.number().default(120000), // 2 minutes in milliseconds
        PAYMENT_API_KEY: Joi.string().required(),

        // Binance configuration (optional for development)
        BINANCE_API_KEY: Joi.string().optional(),
        BINANCE_SECRET_KEY: Joi.string().optional(),
        BINANCE_API_URL: Joi.string().uri().optional(),

        // Hedera configuration
        HEDERA_ACCOUNT_ID: Joi.string().optional(),
        HEDERA_PRIVATE_KEY: Joi.string().optional(),
        HEDERA_NETWORK: Joi.string()
          .valid('mainnet', 'testnet', 'previewnet')
          .default('testnet'),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') !== 'production', // Disable in production
        logging: false, // Disable SQL logging
        ssl:
          configService.get('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
        extra: {
          max: 20, // Maximum number of connections in the pool
          connectionTimeoutMillis: 30000,
          idleTimeoutMillis: 30000,
        },
      }),
      inject: [ConfigService],
    }),
    ExchangeGwModule,
    BinanceClientModule,
    SharedModule,
    QrCodeModule,
    CleanupModule,
    SeedModule,
    UserModule,
    AuthModule,
    CoreModule,
    PaymentOrderModule,
    TransactionModule,
    HealthModule,
    HederaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
