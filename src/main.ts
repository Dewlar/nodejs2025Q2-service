import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggerService } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // logger: new LoggerService(),
  });
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT') || 4000;

  const logger = app.get(LoggerService);
  app.useLogger(logger);

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
