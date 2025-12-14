import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception/http-exception.filter';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // logger: new LoggerService(),
  });
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT') || 4000;

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  app.useGlobalPipes(new ValidationPipe());

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new HttpExceptionFilter(httpAdapterHost));
  // app.useGlobalFilters(app.get(HttpAdapterHost)); // use with `provide: APP_FILTER`

  app.useStaticAssets(
    path.join(__dirname, '..', 'node_modules', 'swagger-ui-dist'),
    { prefix: '/swagger-ui-assets' },
  );

  const fileAPI = fs.readFileSync(
    path.join(__dirname, '../doc/api.yaml'),
    'utf8',
  );
  const docFileAPI = yaml.load(fileAPI);

  SwaggerModule.setup('doc', app, docFileAPI as OpenAPIObject, {
    customCssUrl: '/swagger-ui-assets/swagger-ui.css',
    customJs: [
      '/swagger-ui-assets/swagger-ui-bundle.js',
      '/swagger-ui-assets/swagger-ui-standalone-preset.js',
    ],
  });

  await app.listen(PORT, () => {
    logger.log(`App is running on the port ${PORT}`);
    // console.log('App is running on the port', PORT);
  });
}
bootstrap().then();
