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
import { WorkexpCompanyRepository } from '@features/201-files/domain/repositories/workexp-company.repository';
import { UpdateWorkExpCompanyCommand } from '../../commands/workexp-company/update-workexp-company.command';
import { WorkExpCompany } from '@features/201-files/domain/models/workexp-company.model';

@Injectable()
export class UpdateWorkExpCompanyUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.WORKEXPCOMPANY)
    private readonly workExpCompanyRepository: WorkexpCompanyRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateWorkExpCompanyCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<WorkExpCompany | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_WORKEXPCOMPANY,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_WORKEXPCOMPANY,
          CONSTANTS_DATABASE_MODELS.WORKEXPCOMPANY,
          userId,
          { id, dto },
          requestInfo,
          `Updated workexpcompany: ${dto.desc1}`,
          `Failed to update workexpcompany with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate workexpcompany existence
            const workexpcompanyResult =
              await this.workExpCompanyRepository.findById(id, manager);
            if (!workexpcompanyResult) {
              throw new NotFoundException('WorkexpCompany not found');
            }

            // Update the workexpcompany
            const updateSuccessfull =
              await this.workExpCompanyRepository.update(
                id,
                new WorkExpCompany(dto),
                manager,
              );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException(
                'WorkexpCompany update failed',
              );
            }

            // Retrieve the updated workexpcompany
            const workexpcompany = await this.workExpCompanyRepository.findById(
              id,
              manager,
            );

            return workexpcompany!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
