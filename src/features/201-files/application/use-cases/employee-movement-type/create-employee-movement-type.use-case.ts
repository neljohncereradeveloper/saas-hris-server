import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { EmployeeMovementTypeRepository } from '@features/201-files/domain/repositories/employee-movement-type.repository';
import { CreateEmployeeMovementTypeCommand } from '../../commands/employee-movement-type/create-employee-movement-type.command';
import { EmployeeMovementType } from '@features/201-files/domain/models/employee-movement-type.model';

@Injectable()
export class CreateEmployeeMovementTypeUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE_MOVEMENT_TYPE)
    private readonly employeeMovementTypeRepository: EmployeeMovementTypeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateEmployeeMovementTypeCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<EmployeeMovementType> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_EMPLOYEE_MOVEMENT_TYPE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_EMPLOYEE_MOVEMENT_TYPE,
          CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT_TYPE,
          userId,
          dto,
          requestInfo,
          `Created new employee movement type: ${dto.desc1}`,
          `Failed to create employee movement type: ${dto.desc1}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Create the employeeMovementType
            const employeeMovementType =
              await this.employeeMovementTypeRepository.create(
                new EmployeeMovementType(dto),
                manager,
              );

            return employeeMovementType;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
