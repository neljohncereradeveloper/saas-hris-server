import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { SomethinWentWrongException } from '@features/shared/exceptions/shared';
import { NotFoundException } from '@features/shared/exceptions/shared';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { EmpStatusRepository } from '@features/201-files/domain/repositories/empstatus.repository';
import { UpdateEmpStatusCommand } from '../../commands/empstatus/update-empstatus.command';
import { EmpStatus } from '@features/201-files/domain/models/empstatus';

@Injectable()
export class UpdateEmpStatusUseCase {
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
    dto: UpdateEmpStatusCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<EmpStatus | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_EMPSTATUS,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_EMPSTATUS,
          CONSTANTS_DATABASE_MODELS.EMPSTATUS,
          userId,
          { id, dto },
          requestInfo,
          `Updated empstatus: ${dto.desc1}`,
          `Failed to update empstatus with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate empstatus existence
            const empstatusResult = await this.empStatusRepository.findById(
              id,
              manager,
            );
            if (!empstatusResult) {
              throw new NotFoundException('Empstatus not found');
            }

            // Update the empstatus
            const updateSuccessfull = await this.empStatusRepository.update(
              id,
              new EmpStatus(dto),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('Empstatus update failed');
            }

            // Retrieve the updated empstatus
            const empstatus = await this.empStatusRepository.findById(
              id,
              manager,
            );

            return empstatus!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
