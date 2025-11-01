import { Inject, Injectable } from '@nestjs/common';
import { EmployeeMovementRepository } from '@features/201-files/domain/repositories/employee-movement.repository';
import { EmployeeMovement } from '@features/201-files/domain/models/employee-movement.model';
import { UpdateEmployeeMovementCommand } from '../../commands/employee-movement/update-employee-movement.command';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { NotFoundException } from '@features/shared/exceptions/shared/not-found.exception';
import { SomethinWentWrongException } from '@features/shared/exceptions/shared/something-wentwrong.exception';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { EmployeeMovementTypeRepository } from '@features/201-files/domain/repositories/employee-movement-type.repository';

@Injectable()
export class UpdateEmployeeMovementUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE_MOVEMENT)
    private readonly employeeMovementRepository: EmployeeMovementRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE_MOVEMENT_TYPE)
    private readonly employeeMovementTypeRepository: EmployeeMovementTypeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    command: UpdateEmployeeMovementCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<EmployeeMovement | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE_MOVEMENT,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE_MOVEMENT,
          CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT,
          userId,
          { id, command },
          requestInfo,
          `Updated employee movement with ID: ${id}`,
          `Failed to update employee movement with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate movement exists
            const existingMovement =
              await this.employeeMovementRepository.findById(id, manager);
            if (!existingMovement) {
              throw new NotFoundException('Employee movement not found');
            }

            // Validate employee movement type exists
            const employeeMovementType =
              await this.employeeMovementTypeRepository.findByDescription(
                command.movementType || '',
                manager,
              );
            if (!employeeMovementType) {
              throw new NotFoundException('Employee movement type not found');
            }

            // Update movement record
            const updateData = {
              ...command,
              employeeMovementTypeId: employeeMovementType.id!,
              updatedBy: userId,
            };

            const updateSuccess = await this.employeeMovementRepository.update(
              id,
              updateData,
              manager,
            );

            if (!updateSuccess) {
              throw new SomethinWentWrongException(
                'Employee movement update failed',
              );
            }

            // Retrieve the updated movement
            const updatedMovement =
              await this.employeeMovementRepository.findById(id, manager);

            return updatedMovement;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
