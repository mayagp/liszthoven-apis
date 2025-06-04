import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { Handler } from './exceptions/handler.exception';
import { Response } from './interceptions/response.interception';
import express = require('express');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpAdapter = app.get(HttpAdapterHost);

  app.enableShutdownHooks();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());
  app.useGlobalFilters(new Handler(httpAdapter));
  app.useGlobalInterceptors(new Response());
  app.enableCors({
    origin: (origin, callback) => {
      callback(null, true);
    },
  });

  // await app.listen(3001, '192.168.1.3');
  await app.listen(3000);
}
bootstrap();
