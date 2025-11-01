import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { EduLevelRepository } from '@features/201-files/domain/repositories/edu-level.repository';
import { CreateEduLevelCommand } from '../../commands/edu-level/create-edu-level.command';
import { EduLevel } from '@features/201-files/domain/models/edu-level.model';

@Injectable()
export class CreateEduLevelUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDULEVEL)
    private readonly edulevelRepository: EduLevelRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateEduLevelCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<EduLevel> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_EDULEVEL,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_EDULEVEL,
          CONSTANTS_DATABASE_MODELS.EDULEVEL,
          userId,
          dto,
          requestInfo,
          `Created new edulevel: ${dto.desc1}`,
          `Failed to create edulevel: ${dto.desc1}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Create the edulevel
            const edulevel = await this.edulevelRepository.create(
              new EduLevel(dto),
              manager,
            );

            return edulevel;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
