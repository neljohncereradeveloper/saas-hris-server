import { Injectable, Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { LeaveRequestRepository } from '@features/leave-management/domain/repositories/leave-request.repository';
import { LeaveRequest } from '@features/leave-management/domain/models/leave-request.model';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';

@Injectable()
export class FindLeaveRequestPaginatedListUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_REQUEST)
    private readonly leaveRequestRepository: LeaveRequestRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    term: string,
    page: number,
    limit: number,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<{
    data: LeaveRequest[];
    meta: {
      page: number;
      limit: number;
      totalRecords: number;
      totalPages: number;
      nextPage: number | null;
      previousPage: number | null;
    };
  }> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.FIND_LEAVE_PAGINATED_LIST,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.FIND_LEAVE_PAGINATED_LIST,
          CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST,
          userId,
          { term, page, limit },
          requestInfo,
          `Found paginated leave requests (page: ${page}, limit: ${limit})`,
          `Failed to find paginated leave requests (page: ${page}, limit: ${limit})`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            return await this.leaveRequestRepository.findPaginatedList(
              term,
              page,
              limit,
              manager,
            );
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
