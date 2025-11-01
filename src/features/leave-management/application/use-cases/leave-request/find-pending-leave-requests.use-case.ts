import { Injectable, Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { LeaveRequestRepository } from '@features/leave-management/domain/repositories/leave-request.repository';
import { LeaveRequest } from '@features/leave-management/domain/models/leave-request.model';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';

@Injectable()
export class FindPendingLeaveRequestsUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_REQUEST)
    private readonly leaveRequestRepository: LeaveRequestRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<LeaveRequest[]> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.FIND_PENDING_LEAVE_REQUESTS,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.FIND_PENDING_LEAVE_REQUESTS,
          CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST,
          userId,
          {},
          requestInfo,
          'Found pending leave requests',
          'Failed to find pending leave requests',
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            return await this.leaveRequestRepository.findPending(manager);
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
