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
import { UpdateCivilStatusCommand } from '@features/201-files/application/commands/civilstatus/update-civilstatus.command';
import { CivilStatus } from '@features/201-files/domain/models/civilstatus.model';
import { CivilStatusRepository } from '@features/201-files/domain/repositories/civilstatus.repository';

@Injectable()
export class UpdateCivilStatusUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.CIVILSTATUS)
    private readonly civilStatusRepository: CivilStatusRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateCivilStatusCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<CivilStatus | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_CIVILSTATUS,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_CIVILSTATUS,
          CONSTANTS_DATABASE_MODELS.CIVILSTATUS,
          userId,
          { id, dto },
          requestInfo,
          `Updated civil status: ${dto.desc1}`,
          `Failed to update civil status with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate civilStatus existence
            const civilStatusResult = await this.civilStatusRepository.findById(
              id,
              manager,
            );
            if (!civilStatusResult) {
              throw new NotFoundException('CivilStatus not found');
            }

            // Update the civilStatus
            const updateSuccessfull = await this.civilStatusRepository.update(
              id,
              new CivilStatus(dto),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('CivilStatus update failed');
            }

            // Retrieve the updated civilStatus
            const civilStatus = await this.civilStatusRepository.findById(
              id,
              manager,
            );

            return civilStatus!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
