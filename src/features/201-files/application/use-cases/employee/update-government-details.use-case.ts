import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { SomethinWentWrongException } from '@features/shared/exceptions/shared';
import { NotFoundException } from '@features/shared/exceptions/shared/not-found.exception';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { Employee } from '@features/shared/domain/models/employee.model';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';
import { UpdateGovernmentDetailsCommand } from '@features/201-files/application/commands/employee/update-government-details.command';
@Injectable()
export class UpdateGovernmentDetailsUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE)
    private readonly employeeRepository: EmployeeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    governmentDetails: UpdateGovernmentDetailsCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Employee | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE_GOVERNMENT_DETAILS,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_EMPLOYEE_GOVERNMENT_DETAILS,
          CONSTANTS_DATABASE_MODELS.EMPLOYEE,
          userId,
          { id, governmentDetails },
          requestInfo,
          `Updated government details for employee with ID: ${id}`,
          `Failed to update government details for employee with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate employee existence
            const employeeResult = await this.employeeRepository.findById(
              id,
              manager,
            );
            if (!employeeResult) {
              throw new NotFoundException('Employee not found');
            }

            // Update the employee government details
            const updateSuccessfull =
              await this.employeeRepository.updateEmployeeGovernmentDetails(
                id,
                {
                  phic: governmentDetails.phic,
                  hdmf: governmentDetails.hdmf,
                  sssNo: governmentDetails.sssNo,
                  tinNo: governmentDetails.tinNo,
                  taxExemptCode: governmentDetails.taxExemptCode,
                },
                manager,
              );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('Employee update failed');
            }

            // Retrieve the updated employee
            const employee = await this.employeeRepository.findById(
              id,
              manager,
            );

            return employee!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
