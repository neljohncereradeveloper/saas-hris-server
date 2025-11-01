import { CityRepository } from '@features/201-files/domain/repositories/city.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

@Injectable()
export class SoftDeleteCityUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.CITY)
    private readonly cityRepository: CityRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    isActive: boolean,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.SOFT_DELETE_CITY,
      async (manager) => {
        const action = isActive ? 'activate' : 'deactivate';
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.SOFT_DELETE_CITY,
          CONSTANTS_DATABASE_MODELS.CITY,
          userId,
          { id, isActive },
          requestInfo,
          `City has been ${action}d`,
          `Failed to ${action} city with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate city existence
            const city = await this.cityRepository.findById(id, manager);
            if (!city) {
              throw new NotFoundException('City not found');
            }

            // Soft delete the city
            const softDeleteSuccessfull = await this.cityRepository.softDelete(
              id,
              isActive,
              manager,
            );
            if (!softDeleteSuccessfull) {
              throw new SomethinWentWrongException('City soft delete failed');
            }

            return softDeleteSuccessfull;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
