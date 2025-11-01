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
import { EduLevelRepository } from '@features/201-files/domain/repositories/edu-level.repository';
import { UpdateEduLevelCommand } from '../../commands/edu-level/update-edu-level.command';
import { EduLevel } from '@features/201-files/domain/models/edu-level.model';

@Injectable()
export class UpdateEduLevelUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDULEVEL)
    private readonly edulevelRepository: EduLevelRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateEduLevelCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<EduLevel | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_EDULEVEL,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_EDULEVEL,
          CONSTANTS_DATABASE_MODELS.EDULEVEL,
          userId,
          { id, dto },
          requestInfo,
          `Updated edulevel: ${dto.desc1}`,
          `Failed to update edulevel with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate edulevel existence
            const edulevelResult = await this.edulevelRepository.findById(
              id,
              manager,
            );
            if (!edulevelResult) {
              throw new NotFoundException('EduLevel not found');
            }

            // Update the edulevel
            const updateSuccessfull = await this.edulevelRepository.update(
              id,
              new EduLevel(dto),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('EduLevel update failed');
            }

            // Retrieve the updated edulevel
            const edulevel = await this.edulevelRepository.findById(
              id,
              manager,
            );

            return edulevel!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
