import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Apply ValidationPipe globally to validate all incoming requests
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
      transform: true, // Transform payloads to be objects typed according to their DTO classes
      transformOptions: {
        enableImplicitConversion: true, // Allow implicit type conversions
      },
    }),
  );

  app.setGlobalPrefix('api/v1');
  const config = new DocumentBuilder()
    .setTitle('Zeppex Core API')
    .setDescription('Zeppex Core API MVP documentation')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
      },
      'access-token',
    )
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
