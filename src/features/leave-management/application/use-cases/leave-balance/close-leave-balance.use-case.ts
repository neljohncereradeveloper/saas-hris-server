import { LeaveBalanceRepository } from '@features/leave-management/domain/repositories/leave-balance.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import {
  BadRequestException,
  NotFoundException,
} from '@features/shared/exceptions/shared';
import { EnumLeaveBalanceStatus } from '@features/leave-management/domain/enum/leave-balance-status.enum';

@Injectable()
export class CloseLeaveBalanceUseCase {
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
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CLOSE_LEAVE_BALANCE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CLOSE_LEAVE_BALANCE,
          CONSTANTS_DATABASE_MODELS.LEAVE_BALANCE,
          userId,
          { id },
          requestInfo,
          `Closed leave balance with ID: ${id}`,
          `Failed to close leave balance with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Check if leave balance exists
            const existingBalance = await this.leaveBalanceRepository.findById(
              id,
              manager,
            );
            if (!existingBalance) {
              throw new NotFoundException('Leave balance not found');
            }
            if (existingBalance.status === EnumLeaveBalanceStatus.CLOSED) {
              throw new BadRequestException('Leave balance is already closed');
            }

            // Close the leave balance
            const result = await this.leaveBalanceRepository.closeBalance(
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
