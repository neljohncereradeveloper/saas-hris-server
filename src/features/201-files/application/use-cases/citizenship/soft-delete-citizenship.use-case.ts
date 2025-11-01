import { CitizenShipRepository } from '@features/201-files/domain/repositories/citizenship.repository';
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
export class SoftDeleteCitizenshipUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.CITIZENSHIP)
    private readonly citizenshipRepository: CitizenShipRepository,
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
      CONSTANTS_LOG_ACTION.SOFT_DELETE_CITIZENSHIP,
      async (manager) => {
        const action = isActive ? 'activate' : 'deactivate';
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.SOFT_DELETE_CITIZENSHIP,
          CONSTANTS_DATABASE_MODELS.CITIZENSHIP,
          userId,
          { id, isActive },
          requestInfo,
          `Citizenship has been ${action}d`,
          `Failed to ${action} citizenship with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate citizenship existence
            const citizenship = await this.citizenshipRepository.findById(
              id,
              manager,
            );
            if (!citizenship) {
              throw new NotFoundException('Citizenship not found');
            }

            // Soft delete the citizenship
            const softDeleteSuccessfull =
              await this.citizenshipRepository.softDelete(
                id,
                isActive,
                manager,
              );
            if (!softDeleteSuccessfull) {
              throw new SomethinWentWrongException(
                'Citizenship soft delete failed',
              );
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
