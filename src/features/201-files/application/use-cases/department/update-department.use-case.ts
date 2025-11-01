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
import { UpdateDepartmentCommand } from '@features/201-files/application/commands/department/update-department.command';
import { Dept } from '@features/201-files/domain/models/dept';
import { DepartmentRepository } from '@features/201-files/domain/repositories/department.repository';

@Injectable()
export class UpdateDepartmentUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.DEPARTMENT)
    private readonly departmentRepository: DepartmentRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateDepartmentCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Dept | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_DEPARTMENT,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_DEPARTMENT,
          CONSTANTS_DATABASE_MODELS.DEPARTMENT,
          userId,
          { id, dto },
          requestInfo,
          `Updated department: ${dto.desc1}`,
          `Failed to update department with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate department existence
            const departmentResult = await this.departmentRepository.findById(
              id,
              manager,
            );
            if (!departmentResult) {
              throw new NotFoundException('Department not found');
            }

            // Update the department
            const updateSuccessfull = await this.departmentRepository.update(
              id,
              new Dept(dto),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('Department update failed');
            }

            // Retrieve the updated department
            const department = await this.departmentRepository.findById(
              id,
              manager,
            );

            return department!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
