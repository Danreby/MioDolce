import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';
import type { Env } from './config/env.schema.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  app.use(helmet());
  app.enableCors({ origin: config.get('CORS_ORIGIN', { infer: true }) });

  // Todas as rotas ficam em /api/v1/...
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove campos que não estão no DTO
      forbidNonWhitelisted: true, // ...e rejeita a requisição se vierem
      transform: true, // converte o payload em instância do DTO (com defaults)
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.enableShutdownHooks();

  const swagger = new DocumentBuilder()
    .setTitle('Estoque API')
    .setDescription('API de estudo: categorias, produtos e movimentações de estoque')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('docs', app, () => SwaggerModule.createDocument(app, swagger));

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  Logger.log(`API em http://localhost:${port}/api/v1  |  docs em http://localhost:${port}/docs`, 'Bootstrap');
}

await bootstrap();
