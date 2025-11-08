import { LeaveBalanceRepository } from '@features/leave-management/domain/repositories/leave-balance.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';

@Injectable()
export class ResetLeaveBalancesForYearUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_BALANCE)
    private readonly leaveBalanceRepository: LeaveBalanceRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    year: string,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.RESET_LEAVE_BALANCES_FOR_YEAR,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.RESET_LEAVE_BALANCES_FOR_YEAR,
          CONSTANTS_DATABASE_MODELS.LEAVE_BALANCE,
          userId,
          { year },
          requestInfo,
          `Reset leave balances for year: ${year}`,
          `Failed to reset leave balances for year: ${year}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Reset balances for the specified year
            const result =
              await this.leaveBalanceRepository.resetBalancesForYear(
                year,
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
