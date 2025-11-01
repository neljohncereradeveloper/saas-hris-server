import { CivilStatus } from '@features/201-files/domain/models/civilstatus.model';
import { CivilStatusRepository } from '@features/201-files/domain/repositories/civilstatus.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CreateCivilStatusCommand } from '@features/201-files/application/commands/civilstatus/create-civilstatus.command';

@Injectable()
export class CreateCivilStatusUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.CIVILSTATUS)
    private readonly civilStatusRepository: CivilStatusRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateCivilStatusCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<CivilStatus> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_CIVILSTATUS,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_CIVILSTATUS,
          CONSTANTS_DATABASE_MODELS.CIVILSTATUS,
          userId,
          dto,
          requestInfo,
          `Created new civil status: ${dto.desc1}`,
          `Failed to create civil status: ${dto.desc1}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Create the civilStatus
            const civilStatus = await this.civilStatusRepository.create(
              new CivilStatus(dto),
              manager,
            );

            return civilStatus;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
