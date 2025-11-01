import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { WorkexpCompanyRepository } from '@features/201-files/domain/repositories/workexp-company.repository';
import { CreateWorkExpCompanyCommand } from '../../commands/workexp-company/create-workexp-company.command';
import { WorkExpCompany } from '@features/201-files/domain/models/workexp-company.model';

@Injectable()
export class CreateWorkExpCompanyUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.WORKEXPCOMPANY)
    private readonly workexpCompanyRepository: WorkexpCompanyRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateWorkExpCompanyCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<WorkExpCompany> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_WORKEXPCOMPANY,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_WORKEXPCOMPANY,
          CONSTANTS_DATABASE_MODELS.WORKEXPCOMPANY,
          userId,
          dto,
          requestInfo,
          `Created new workexpcompany: ${dto.desc1}`,
          `Failed to create workexpcompany: ${dto.desc1}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Create the workexpcompany
            const workexpcompany = await this.workexpCompanyRepository.create(
              new WorkExpCompany(dto),
              manager,
            );

            return workexpcompany;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
