import { Injectable, Inject } from '@nestjs/common';
import { EmployeeMovementRepository } from '@features/201-files/domain/repositories/employee-movement.repository';
import { EmployeeMovement } from '@features/201-files/domain/models/employee-movement.model';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';

@Injectable()
export class FindEmployeeMovementsByEmployeeUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE_MOVEMENT)
    private readonly employeeMovementRepository: EmployeeMovementRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    employeeId: number,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<EmployeeMovement[]> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.FIND_EMPLOYEE_BY_ID,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.FIND_EMPLOYEE_BY_ID,
          CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT,
          userId,
          { employeeId },
          requestInfo,
          `Retrieved employee movements for employee ID: ${employeeId}`,
          `Failed to retrieve employee movements for employee ID: ${employeeId}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            const movements =
              await this.employeeMovementRepository.findByEmployeeId(
                employeeId,
                manager,
              );
            return movements;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
