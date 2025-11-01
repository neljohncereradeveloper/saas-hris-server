import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import {
  JsonWebTokenError,
  TokenExpiredError,
  NotBeforeError,
} from 'jsonwebtoken';

@Catch(JsonWebTokenError, TokenExpiredError, NotBeforeError)
export class JwtExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let message = 'Unauthorized';
    let statusCode = 401;

    if (exception instanceof TokenExpiredError) {
      message = 'JWT token expired';
    } else if (exception instanceof JsonWebTokenError) {
      message = 'Invalid JWT token';
    } else if (exception instanceof NotBeforeError) {
      message = 'JWT token not yet valid';
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error: 'Unauthorized',
      timestamp: new Date().toISOString(),
    });
  }
}
