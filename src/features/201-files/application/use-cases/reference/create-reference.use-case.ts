import { Reference } from '@features/201-files/domain/models/reference.model';
import { ReferenceRepository } from '@features/201-files/domain/repositories/reference.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CreateReferenceCommand } from '@features/201-files/application/commands/reference/create-reference.command';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';
import { NotFoundException } from '@features/shared/exceptions/shared';

@Injectable()
export class CreateReferenceUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.REFERENCE)
    private readonly referenceRepository: ReferenceRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE)
    private readonly employeeRepository: EmployeeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateReferenceCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Reference> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_REFERENCE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_REFERENCE,
          CONSTANTS_DATABASE_MODELS.REFERENCE,
          userId,
          dto,
          requestInfo,
          `Created new reference For Employee: ${dto.employeeId}`,
          `Failed to create reference For Employee: ${dto.employeeId}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Check if the employee exists
            const employee = await this.employeeRepository.findById(
              dto.employeeId,
              manager,
            );
            if (!employee) {
              throw new NotFoundException(
                `Employee with ID ${dto.employeeId} not found`,
              );
            }
            // Create the reference
            const reference = await this.referenceRepository.create(
              new Reference(dto),
              manager,
            );

            return reference;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
