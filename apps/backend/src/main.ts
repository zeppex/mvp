import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const isProduction = configService.get('NODE_ENV') === 'production';

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Compression middleware
  app.use(compression());

  // Enable CORS for frontend requests
  app.enableCors({
    origin: configService.get('FRONTEND_URL') || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

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

  app.setGlobalPrefix('api/v1');

  // Enhanced Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Zeppex Core API')
    .setDescription(
      `
      # Zeppex Core API Documentation
      
      This API provides comprehensive payment processing capabilities for merchants, including:
      
      ## Features
      - **Multi-tenant Architecture**: Support for multiple merchants with isolated data
      - **Role-based Access Control**: Hierarchical user roles (SuperAdmin, Admin, Branch Admin, Cashier)
      - **Payment Processing**: Integration with Binance Pay and other exchanges
      - **Transaction Management**: Complete transaction lifecycle management
      
      ## Authentication
      All endpoints require JWT authentication. Include the token in the Authorization header:
      \`Authorization: Bearer <your-jwt-token>\`
      
      ## Rate Limiting
      API requests are rate-limited to ensure fair usage and system stability.
      
      ## Error Handling
      The API returns standardized error responses with appropriate HTTP status codes.
    `,
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
        description: 'Enter your JWT token in the format: Bearer <token>',
      },
      'access-token',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('merchants', 'Merchant management')
    .addTag('branches', 'Branch management')
    .addTag('pos', 'Point of Sale management')
    .addTag('payment-orders', 'Payment order processing')
    .addTag('transactions', 'Transaction management')
    .addTag('users', 'User management')
    .addTag('treasury', 'Treasury and token management')
    .setVersion('1.0.0')
    .setContact('Zeppex Support', 'https://zeppex.com', 'support@zeppex.com')
    .setLicense('Proprietary', 'https://zeppex.com/license')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Custom Swagger UI options
  SwaggerModule.setup('api/v1/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
    customSiteTitle: 'Zeppex API Documentation',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; }
      .swagger-ui .info .description { font-size: 14px; }
    `,
  });

  const port = configService.get('PORT') || 4000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(
    `📚 API Documentation available at: http://localhost:${port}/api/v1/docs`,
  );
  logger.log(`🌍 Environment: ${configService.get('NODE_ENV')}`);

  if (!isProduction) {
    logger.log(`🔗 Frontend URL: ${configService.get('FRONTEND_URL')}`);
    logger.log(
      `🗄️  Database: ${configService.get('DB_HOST')}:${configService.get('DB_PORT')}/${configService.get('DB_NAME')}`,
    );
  }
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
