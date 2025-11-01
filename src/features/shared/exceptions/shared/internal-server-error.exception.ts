import { DomainException } from '../domain.exception';

export class InternalServerErrorException extends DomainException {
  constructor(
    message: string = 'Internal Server Error',
    statusCode: number = 500,
  ) {
    super(message, 'INTERNAL_SERVER_ERROR_EXCEPTION', statusCode);
  }
}
