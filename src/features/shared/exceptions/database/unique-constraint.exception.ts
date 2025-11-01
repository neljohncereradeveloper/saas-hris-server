import { DomainException } from '../domain.exception';

export class UniqueConstraintException extends DomainException {
  constructor(
    message: string = 'A record with this information already exists',
    field?: string,
  ) {
    const errorMessage = field
      ? `A record with this ${field} already exists`
      : message;

    super(errorMessage, 'UNIQUE_CONSTRAINT_VIOLATION', 409);
  }
}
