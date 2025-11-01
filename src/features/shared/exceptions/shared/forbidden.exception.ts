import { DomainException } from '../domain.exception';

export class ForbiddenException extends DomainException {
  constructor(message: string = 'Forbidden', statusCode: number = 403) {
    super(message, 'FORBIDDEN_EXCEPTION', statusCode);
  }
}
