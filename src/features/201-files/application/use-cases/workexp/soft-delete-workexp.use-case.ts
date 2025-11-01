import { WorkExpRepository } from '@features/201-files/domain/repositories/workexp.repository';
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
export class SoftDeleteWorkExpUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.WORKEXP)
    private readonly workexpRepository: WorkExpRepository,
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
      CONSTANTS_LOG_ACTION.SOFT_DELETE_WORKEXP,
      async (manager) => {
        const action = isActive ? 'activate' : 'deactivate';
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.SOFT_DELETE_WORKEXP,
          CONSTANTS_DATABASE_MODELS.WORKEXP,
          userId,
          { id, isActive },
          requestInfo,
          `Work experience has been ${action}d`,
          `Failed to ${action} work experience with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate workexp existence
            const workexp = await this.workexpRepository.findById(id, manager);
            if (!workexp) {
              throw new NotFoundException('Workexp not found');
            }

            // Soft delete the workexp
            const softDeleteSuccessfull =
              await this.workexpRepository.softDelete(id, isActive, manager);
            if (!softDeleteSuccessfull) {
              throw new SomethinWentWrongException(
                'Workexp soft delete failed',
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
