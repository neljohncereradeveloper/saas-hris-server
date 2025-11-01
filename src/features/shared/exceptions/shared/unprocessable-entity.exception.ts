import { DomainException } from '../domain.exception';

export class UnprocessableEntityException extends DomainException {
  constructor(
    message: string = 'Unprocessable Entity',
    statusCode: number = 422,
  ) {
    super(message, 'UNPROCESSABLE_ENTITY_EXCEPTION', statusCode);
  }
}
