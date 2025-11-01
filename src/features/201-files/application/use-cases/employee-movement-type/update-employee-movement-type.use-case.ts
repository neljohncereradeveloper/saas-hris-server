import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import {
  SomethinWentWrongException,
  NotFoundException,
} from '@features/shared/exceptions/shared';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { UpdateEmployeeMovementTypeCommand } from '@features/201-files/application/commands/employee-movement-type/update-employee-movement-type.command';
import { EmployeeMovementType } from '@features/201-files/domain/models/employee-movement-type.model';
import { EmployeeMovementTypeRepository } from '@features/201-files/domain/repositories/employee-movement-type.repository';

@Injectable()
export class UpdateEmployeeMovementTypeUseCase {
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
    dto: UpdateEmployeeMovementTypeCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<EmployeeMovementType | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE_MOVEMENT_TYPE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE_MOVEMENT_TYPE,
          CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT_TYPE,
          userId,
          { id, dto },
          requestInfo,
          `Updated employee movement type: ${dto.desc1}`,
          `Failed to update employee movement type with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate employeeMovementType existence
            const employeeMovementTypeResult =
              await this.employeeMovementTypeRepository.findById(id, manager);
            if (!employeeMovementTypeResult) {
              throw new NotFoundException('EmployeeMovementType not found');
            }

            // Update the employeeMovementType
            const updateSuccessfull =
              await this.employeeMovementTypeRepository.update(
                id,
                new EmployeeMovementType(dto),
                manager,
              );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException(
                'EmployeeMovementType update failed',
              );
            }

            // Retrieve the updated employeeMovementType
            const employeeMovementType =
              await this.employeeMovementTypeRepository.findById(id, manager);

            return employeeMovementType!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
