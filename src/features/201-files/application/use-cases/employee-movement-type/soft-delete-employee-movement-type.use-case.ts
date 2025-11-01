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
import { EmployeeMovementTypeRepository } from '@features/201-files/domain/repositories/employee-movement-type.repository';

@Injectable()
export class SoftDeleteEmployeeMovementTypeUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE_MOVEMENT_TYPE)
    private readonly employeeMovementTypeRepository: EmployeeMovementTypeRepository,
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
      CONSTANTS_LOG_ACTION.SOFT_DELETE_EMPLOYEE_MOVEMENT_TYPE,
      async (manager) => {
        const action = isActive ? 'activate' : 'deactivate';
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.SOFT_DELETE_EMPLOYEE_MOVEMENT_TYPE,
          CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT_TYPE,
          userId,
          { id, isActive },
          requestInfo,
          `Employee movement type has been ${action}d`,
          `Failed to ${action} employee movement type with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate civilStatus existence
            const employeeMovementType =
              await this.employeeMovementTypeRepository.findById(id, manager);
            if (!employeeMovementType) {
              throw new NotFoundException('EmployeeMovementType not found');
            }

            // Soft delete the civilStatus
            const softDeleteSuccessfull =
              await this.employeeMovementTypeRepository.softDelete(
                id,
                isActive,
                manager,
              );
            if (!softDeleteSuccessfull) {
              throw new SomethinWentWrongException(
                'EmployeeMovementType soft delete failed',
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
