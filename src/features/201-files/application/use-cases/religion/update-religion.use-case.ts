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
import { UpdateReligionCommand } from '@features/201-files/application/commands/religion/update-religion.command';
import { Religion } from '@features/201-files/domain/models/religion.model';
import { ReligionRepository } from '@features/201-files/domain/repositories/religion.repository';

@Injectable()
export class UpdateReligionUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.RELIGION)
    private readonly religionRepository: ReligionRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateReligionCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Religion | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_RELIGION,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_RELIGION,
          CONSTANTS_DATABASE_MODELS.RELIGION,
          userId,
          { id, dto },
          requestInfo,
          `Updated religion: ${dto.desc1}`,
          `Failed to update religion with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate religion existence
            const religionResult = await this.religionRepository.findById(
              id,
              manager,
            );
            if (!religionResult) {
              throw new NotFoundException('Religion not found');
            }

            // Update the religion
            const updateSuccessfull = await this.religionRepository.update(
              id,
              new Religion(dto),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('Religion update failed');
            }

            // Retrieve the updated religion
            const religion = await this.religionRepository.findById(
              id,
              manager,
            );

            return religion!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
