import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { fail } from '../responses/api-response';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const payload = exception.getResponse() as
      | string
      | { message?: string | string[]; [key: string]: unknown };
    const message =
      typeof payload === 'string'
        ? payload
        : Array.isArray(payload.message)
          ? payload.message.join(', ')
          : (payload.message ?? exception.message);

    const body = fail(message, payload, status);
    response.status(status).json(body);
  }
}
