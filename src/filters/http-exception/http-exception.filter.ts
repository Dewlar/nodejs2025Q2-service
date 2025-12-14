import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class HttpExceptionFilter<T> implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: T, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    // default values
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let clientMessage = 'Internal server error';
    let logMessage = 'Unknown error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      clientMessage = exception.message;
      logMessage = exception.message;
    } else if (exception instanceof Error) {
      logMessage = exception.message;
    } else {
      logMessage = String(exception);
    }

    const path = httpAdapter.getRequestUrl(request);
    const timestamp = new Date().toISOString();
    const errorMessage = `${request.method} ${path} - StatusCode: ${status} - Message: ${logMessage}`;

    // system log
    if (status >= 500) {
      this.logger.error(
        errorMessage,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else if (status >= 400) {
      this.logger.warn(errorMessage);
    } else {
      this.logger.log(errorMessage);
    }

    // response to the client
    const responseBody = {
      statusCode: status,
      timestamp,
      path,
      message: clientMessage,
    };

    httpAdapter.reply(response, responseBody, status);
  }
}
