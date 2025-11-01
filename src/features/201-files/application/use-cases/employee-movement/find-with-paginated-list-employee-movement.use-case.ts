import { Injectable, Inject } from '@nestjs/common';
import { EmployeeMovementRepository } from '@features/201-files/domain/repositories/employee-movement.repository';
import { EmployeeMovement } from '@features/201-files/domain/models/employee-movement.model';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class FindWithPaginatedListEmployeeMovementUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE_MOVEMENT)
    private readonly employeeMovementRepository: EmployeeMovementRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    page: number,
    limit: number,
    filters?: {
      employeeId?: number;
      movementType?: string;
      effectiveDateFrom?: Date;
      effectiveDateTo?: Date;
      searchTerm?: string;
    },
    userId?: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<{
    data: EmployeeMovement[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.FIND_EMPLOYEE_BY_ID,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.FIND_EMPLOYEE_BY_ID,
          CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT,
          userId || 'system',
          { page, limit, filters },
          requestInfo,
          `Retrieved paginated employee movements list`,
          `Failed to retrieve paginated employee movements list`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            const result =
              await this.employeeMovementRepository.findWithPagination(
                page,
                limit,
                manager,
                filters,
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
