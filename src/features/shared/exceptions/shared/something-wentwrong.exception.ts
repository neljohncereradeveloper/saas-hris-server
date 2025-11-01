// domain/exceptions/event-update.exception.ts

import { DomainException } from '../domain.exception';

export class SomethinWentWrongException extends DomainException {
  constructor(message: string, statusCode: number = 500) {
    super(message, 'SOMETHING_WENTWRONG', statusCode);
  }
}
