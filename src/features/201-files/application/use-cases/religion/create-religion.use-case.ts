import { Religion } from '@features/201-files/domain/models/religion.model';
import { ReligionRepository } from '@features/201-files/domain/repositories/religion.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CreateReligionCommand } from '@features/201-files/application/commands/religion/create-religion.command';

@Injectable()
export class CreateReligionUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.RELIGION)
    private readonly religionRepository: ReligionRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateReligionCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Religion> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_RELIGION,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_RELIGION,
          CONSTANTS_DATABASE_MODELS.RELIGION,
          userId,
          dto,
          requestInfo,
          `Created new religion: ${dto.desc1}`,
          `Failed to create religion: ${dto.desc1}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Create the religion
            const religion = await this.religionRepository.create(
              new Religion(dto),
              manager,
            );

            return religion;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
