// domain/exceptions/event-update.exception.ts

import { DomainException } from '../domain.exception';

export class BadRequestException extends DomainException {
  constructor(message: string, statusCode: number = 400) {
    super(message, 'BAD_REQUEST_EXCEPTION', statusCode);
  }
}
