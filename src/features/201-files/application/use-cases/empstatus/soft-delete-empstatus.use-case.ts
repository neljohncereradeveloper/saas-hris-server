import { EmpStatusRepository } from '@features/201-files/domain/repositories/empstatus.repository';
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

@Injectable()
export class SoftDeleteEmpStatusUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPSTATUS)
    private readonly empStatusRepository: EmpStatusRepository,
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
      CONSTANTS_LOG_ACTION.SOFT_DELETE_EMPSTATUS,
      async (manager) => {
        const action = isActive ? 'activate' : 'deactivate';
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.SOFT_DELETE_EMPSTATUS,
          CONSTANTS_DATABASE_MODELS.EMPSTATUS,
          userId,
          { id, isActive },
          requestInfo,
          `Employee status has been ${action}d`,
          `Failed to ${action} employee status with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate empstatus existence
            const empstatus = await this.empStatusRepository.findById(
              id,
              manager,
            );
            if (!empstatus) {
              throw new NotFoundException('Empstatus not found');
            }

            // Soft delete the empstatus
            const softDeleteSuccessfull =
              await this.empStatusRepository.softDelete(id, isActive, manager);
            if (!softDeleteSuccessfull) {
              throw new SomethinWentWrongException(
                'Empstatus soft delete failed',
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
