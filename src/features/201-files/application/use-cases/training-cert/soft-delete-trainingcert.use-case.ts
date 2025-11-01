import { TrainingCertRepository } from '@features/201-files/domain/repositories/training-cert.repository';
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
export class SoftDeleteTrainingCertUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRAININGCERT)
    private readonly trainingcertRepository: TrainingCertRepository,
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
      CONSTANTS_LOG_ACTION.SOFT_DELETE_TRAININGCERT,
      async (manager) => {
        const action = isActive ? 'activate' : 'deactivate';
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.SOFT_DELETE_TRAININGCERT,
          CONSTANTS_DATABASE_MODELS.TRAININGCERT,
          userId,
          { id, isActive },
          requestInfo,
          `Training certificate has been ${action}d`,
          `Failed to ${action} training certificate with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate trainingcert existence
            const trainingcert = await this.trainingcertRepository.findById(
              id,
              manager,
            );
            if (!trainingcert) {
              throw new NotFoundException('Trainingcert not found');
            }

            // Soft delete the trainingcert
            const softDeleteSuccessfull =
              await this.trainingcertRepository.softDelete(
                id,
                isActive,
                manager,
              );
            if (!softDeleteSuccessfull) {
              throw new SomethinWentWrongException(
                'Trainingcert soft delete failed',
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
