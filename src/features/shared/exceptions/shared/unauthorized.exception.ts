import { DomainException } from '../domain.exception';

export class UnauthorizedException extends DomainException {
  constructor(message: string = 'Unauthorized', statusCode: number = 401) {
    super(message, 'UNAUTHORIZED_EXCEPTION', statusCode);
  }
}
