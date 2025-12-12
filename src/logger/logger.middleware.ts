import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  // standard logger - output to console
  // private logger = new Logger(LoggerMiddleware.name);
  // custom LoggerService - output in file and console
  constructor(private readonly logger: LoggerService) {}

  use(request: Request, response: Response, next: NextFunction) {
    const { ip, method, originalUrl, query, body } = request;
    const userAgent = request.get('User-Agent') || '';
    const requestStart = Date.now();

    response.on('finish', () => {
      const { statusCode } = response;
      const processingTime = Date.now() - requestStart;

      // simple log:
      // const contentLength = response.get('content-length') ?? '-';
      // this.logger.log(`${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip} - ${processingTime}ms`);

      // structured log:
      this.logger.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          method,
          originalUrl,
          query,
          body,
          statusCode,
          ip,
          userAgent,
          processingTime,
        }),
      );
    });

    next();
  }
}
