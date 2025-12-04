import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<number>('PORT') || 4000;

  const fileAPI = fs.readFileSync(
    path.join(__dirname, '../doc/api.yaml'),
    'utf8',
  );
  const docFileAPI = yaml.load(fileAPI);

  SwaggerModule.setup('doc', app, docFileAPI as OpenAPIObject);

  await app.listen(PORT, () => console.log('App is running on the port', PORT));
}
bootstrap().then();
