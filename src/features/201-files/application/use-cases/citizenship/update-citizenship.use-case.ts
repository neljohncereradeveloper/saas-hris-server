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
import { UpdateCitizenShipCommand } from '@features/201-files/application/commands/citizenship/update-citizenship.command';
import { CitizenShip } from '@features/201-files/domain/models/citizenship.model';
import { CitizenShipRepository } from '@features/201-files/domain/repositories/citizenship.repository';

@Injectable()
export class UpdateCitizenshipUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.CITIZENSHIP)
    private readonly citizenshipRepository: CitizenShipRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateCitizenShipCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<CitizenShip | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_CITIZENSHIP,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_CITIZENSHIP,
          CONSTANTS_DATABASE_MODELS.CITIZENSHIP,
          userId,
          { id, dto },
          requestInfo,
          `Updated citizenship: ${dto.desc1}`,
          `Failed to update citizenship with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate citizenship existence
            const citizenshipResult = await this.citizenshipRepository.findById(
              id,
              manager,
            );
            if (!citizenshipResult) {
              throw new NotFoundException('Citizenship not found');
            }

            // Update the citizenship
            const updateSuccessfull = await this.citizenshipRepository.update(
              id,
              new CitizenShip(dto),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('Citizenship update failed');
            }

            // Retrieve the updated citizenship
            const citizenship = await this.citizenshipRepository.findById(
              id,
              manager,
            );

            return citizenship!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
