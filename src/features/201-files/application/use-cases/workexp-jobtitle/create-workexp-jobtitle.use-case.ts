import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { WorkExpJobTitleRepository } from '@features/201-files/domain/repositories/workexp-jobtitle.repository';
import { CreateWorkExpJobTitleCommand } from '../../commands/workexp-jobtitle/create-workexp-jobtitle.command';
import { WorkExpJobTitle } from '@features/201-files/domain/models/workexp-jobtitle.model';

@Injectable()
export class CreateWorkExpJobTitleUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.WORKEXPJOBTITLE)
    private readonly workExpJobTitleRepository: WorkExpJobTitleRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateWorkExpJobTitleCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<WorkExpJobTitle> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_WORKEXPJOBTITLE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_WORKEXPJOBTITLE,
          CONSTANTS_DATABASE_MODELS.WORKEXPJOBTITLE,
          userId,
          dto,
          requestInfo,
          `Created new workexpjobtitle: ${dto.desc1}`,
          `Failed to create workexpjobtitle: ${dto.desc1}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Create the workexpjobtitle
            const workexpjobtitle = await this.workExpJobTitleRepository.create(
              new WorkExpJobTitle(dto),
              manager,
            );

            return workexpjobtitle;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
