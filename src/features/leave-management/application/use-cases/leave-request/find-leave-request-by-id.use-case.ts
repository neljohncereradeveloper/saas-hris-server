import { Injectable, Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { LeaveRequestRepository } from '@features/leave-management/domain/repositories/leave-request.repository';
import { LeaveRequest } from '@features/leave-management/domain/models/leave-request.model';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';

@Injectable()
export class FindLeaveRequestByIdUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_REQUEST)
    private readonly leaveRequestRepository: LeaveRequestRepository,
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
  ): Promise<LeaveRequest | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.FIND_LEAVE_BY_ID,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.FIND_LEAVE_BY_ID,
          CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST,
          userId,
          { id },
          requestInfo,
          `Found leave request with ID: ${id}`,
          `Failed to find leave request with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            return await this.leaveRequestRepository.findById(id, manager);
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}

