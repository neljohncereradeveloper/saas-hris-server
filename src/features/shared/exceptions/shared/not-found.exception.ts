// domain/exceptions/event-update.exception.ts

import { DomainException } from '../domain.exception';

export class NotFoundException extends DomainException {
  constructor(message: string, statusCode: number = 404) {
    super(message, 'NOT_FOUND_EXCEPTION', statusCode);
  }
}
