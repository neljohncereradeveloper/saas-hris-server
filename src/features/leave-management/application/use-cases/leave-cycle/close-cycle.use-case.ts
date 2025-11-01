import { LeaveCycleRepository } from '@features/leave-management/domain/repositories/leave-cycle.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { NotFoundException } from '@features/shared/exceptions/shared';

@Injectable()
export class CloseCycleUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_CYCLE)
    private readonly leaveCycleRepository: LeaveCycleRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CLOSE_LEAVE_CYCLE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CLOSE_LEAVE_CYCLE,
          CONSTANTS_DATABASE_MODELS.LEAVE_CYCLE,
          userId,
          { id },
          requestInfo,
          `Closed leave cycle ${id}`,
          `Failed to close leave cycle ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Verify cycle exists
            const cycle = await this.leaveCycleRepository.findById(id, manager);
            if (!cycle) {
              throw new NotFoundException(
                `Leave cycle with id ${id} not found`,
              );
            }

            // Close the cycle
            const result = await this.leaveCycleRepository.closeCycle(
              id,
              manager,
            );

            return result;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
