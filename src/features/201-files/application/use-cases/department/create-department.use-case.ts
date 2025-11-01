import { DepartmentRepository } from '@features/201-files/domain/repositories/department.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CreateDepartmentCommand } from '@features/201-files/application/commands/department/create-department.command';
import { Dept } from '@features/201-files/domain/models/dept';

@Injectable()
export class CreateDepartmentUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.DEPARTMENT)
    private readonly departmentRepository: DepartmentRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateDepartmentCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Dept> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_DEPARTMENT,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_DEPARTMENT,
          CONSTANTS_DATABASE_MODELS.DEPARTMENT,
          userId,
          dto,
          requestInfo,
          `Created new department: ${dto.desc1}`,
          `Failed to create department: ${dto.desc1}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Create the department
            const department = await this.departmentRepository.create(
              new Dept(dto),
              manager,
            );

            return department;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
