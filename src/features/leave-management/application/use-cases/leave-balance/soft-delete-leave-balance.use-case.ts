import { LeaveBalanceRepository } from '@features/leave-management/domain/repositories/leave-balance.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';

@Injectable()
export class SoftDeleteLeaveBalanceUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_BALANCE)
    private readonly leaveBalanceRepository: LeaveBalanceRepository,
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
      CONSTANTS_LOG_ACTION.SOFT_DELETE_LEAVE_BALANCE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.SOFT_DELETE_LEAVE_BALANCE,
          CONSTANTS_DATABASE_MODELS.LEAVE_BALANCE,
          userId,
          { id, isActive },
          requestInfo,
          `Soft deleted leave balance with ID: ${id}`,
          `Failed to soft delete leave balance with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Check if leave balance exists
            const existingBalance = await this.leaveBalanceRepository.findById(
              id,
              manager,
            );
            if (!existingBalance) {
              throw new Error('Leave balance not found');
            }

            // Soft delete the leave balance
            const result = await this.leaveBalanceRepository.softDelete(
              id,
              isActive,
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
