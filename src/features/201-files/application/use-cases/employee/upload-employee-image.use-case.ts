import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';

export interface UploadEmployeeImageCommand {
  employeeId: number;
  imagePath: string;
  userId: string;
  requestInfo?: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    username?: string;
  };
}

@Injectable()
export class UploadEmployeeImageUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE)
    private readonly employeeRepository: EmployeeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(command: UploadEmployeeImageCommand): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE_IMAGE_PATH,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE_IMAGE_PATH,
          CONSTANTS_DATABASE_MODELS.EMPLOYEE,
          command.userId,
          { employeeId: command.employeeId, imagePath: command.imagePath },
          command.requestInfo,
          `Updated image for employee with ID: ${command.employeeId}`,
          `Failed to update image for employee with ID: ${command.employeeId}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            const updated =
              await this.employeeRepository.updateEmployeeImagePath(
                command.employeeId,
                command.imagePath,
                manager,
              );

            return updated;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
