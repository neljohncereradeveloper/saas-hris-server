import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { JobTitleRepository } from '@features/201-files/domain/repositories/jobtitle.repository';
import { CreateJobTitleCommand } from '../../commands/jobtitle/create-jobtitle.command';
import { JobTitle } from '@features/201-files/domain/models/jobtitle.model';

@Injectable()
export class CreateJobTitleUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.JOBTITLE)
    private readonly jobTitleRepository: JobTitleRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateJobTitleCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<JobTitle> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_JOBTITLE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_JOBTITLE,
          CONSTANTS_DATABASE_MODELS.JOBTITLE,
          userId,
          dto,
          requestInfo,
          `Created new jobtitle: ${dto.desc1}`,
          `Failed to create jobtitle: ${dto.desc1}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Create the jobtitle
            const jobtitle = await this.jobTitleRepository.create(
              new JobTitle(dto),
              manager,
            );

            return jobtitle;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
