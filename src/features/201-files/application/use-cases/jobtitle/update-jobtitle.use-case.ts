import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { SomethinWentWrongException } from '@features/shared/exceptions/shared';
import { NotFoundException } from '@features/shared/exceptions/shared';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { JobTitleRepository } from '@features/201-files/domain/repositories/jobtitle.repository';
import { UpdateJobTitleCommand } from '../../commands/jobtitle/update-jobtitle.command';
import { JobTitle } from '@features/201-files/domain/models/jobtitle.model';

@Injectable()
export class UpdateJobTitleUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.JOBTITLE)
    private readonly jobTitleRepository: JobTitleRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateJobTitleCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<JobTitle | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_JOBTITLE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_JOBTITLE,
          CONSTANTS_DATABASE_MODELS.JOBTITLE,
          userId,
          { id, dto },
          requestInfo,
          `Updated jobtitle: ${dto.desc1}`,
          `Failed to update jobtitle with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate jobtitle existence
            const jobtitleResult = await this.jobTitleRepository.findById(
              id,
              manager,
            );
            if (!jobtitleResult) {
              throw new NotFoundException('Jobtitle not found');
            }

            // Update the jobtitle
            const updateSuccessfull = await this.jobTitleRepository.update(
              id,
              new JobTitle(dto),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('Jobtitle update failed');
            }

            // Retrieve the updated jobtitle
            const jobtitle = await this.jobTitleRepository.findById(
              id,
              manager,
            );

            return jobtitle!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
