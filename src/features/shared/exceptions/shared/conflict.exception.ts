import { DomainException } from '../domain.exception';

export class ConflictException extends DomainException {
  constructor(message: string = 'Conflict', statusCode: number = 409) {
    super(message, 'CONFLICT_EXCEPTION', statusCode);
  }
}
