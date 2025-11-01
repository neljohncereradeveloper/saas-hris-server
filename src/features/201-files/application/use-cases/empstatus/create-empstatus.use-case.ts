import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { EmpStatusRepository } from '@features/201-files/domain/repositories/empstatus.repository';
import { CreateEmpStatusCommand } from '../../commands/empstatus/create-empstatus.command';
import { EmpStatus } from '@features/201-files/domain/models/empstatus';

@Injectable()
export class CreateEmpStatusUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPSTATUS)
    private readonly empStatusRepository: EmpStatusRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateEmpStatusCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<EmpStatus> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_EMPSTATUS,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_EMPSTATUS,
          CONSTANTS_DATABASE_MODELS.EMPSTATUS,
          userId,
          dto,
          requestInfo,
          `Created new empstatus: ${dto.desc1}`,
          `Failed to create empstatus: ${dto.desc1}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Create the empstatus
            const empstatus = await this.empStatusRepository.create(
              new EmpStatus(dto),
              manager,
            );

            return empstatus;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
