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
import { WorkExpJobTitleRepository } from '@features/201-files/domain/repositories/workexp-jobtitle.repository';
import { UpdateWorkExpJobTitleCommand } from '../../commands/workexp-jobtitle/update-workexp-jobtitle.command';
import { WorkExpJobTitle } from '@features/201-files/domain/models/workexp-jobtitle.model';

@Injectable()
export class UpdateWorkExpJobTitleUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.WORKEXPJOBTITLE)
    private readonly workExpJobTitleRepository: WorkExpJobTitleRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateWorkExpJobTitleCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<WorkExpJobTitle | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_WORKEXPJOBTITLE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_WORKEXPJOBTITLE,
          CONSTANTS_DATABASE_MODELS.WORKEXPJOBTITLE,
          userId,
          { id, dto },
          requestInfo,
          `Updated workexpjobtitle: ${dto.desc1}`,
          `Failed to update workexpjobtitle with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate workexpjobtitle existence
            const workexpjobtitleResult =
              await this.workExpJobTitleRepository.findById(id, manager);
            if (!workexpjobtitleResult) {
              throw new NotFoundException('WorkexpJobtitle not found');
            }

            // Update the workexpjobtitle
            const updateSuccessfull =
              await this.workExpJobTitleRepository.update(
                id,
                new WorkExpJobTitle(dto),
                manager,
              );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException(
                'WorkexpJobtitle update failed',
              );
            }

            // Retrieve the updated workexpjobtitle
            const workexpjobtitle =
              await this.workExpJobTitleRepository.findById(id, manager);

            return workexpjobtitle!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
