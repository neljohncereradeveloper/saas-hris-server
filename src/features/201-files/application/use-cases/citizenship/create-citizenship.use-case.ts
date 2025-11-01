import { CitizenShip } from '@features/201-files/domain/models/citizenship.model';
import { CitizenShipRepository } from '@features/201-files/domain/repositories/citizenship.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CreateCitizenShipCommand } from '@features/201-files/application/commands/citizenship/create-citizenship.command';

@Injectable()
export class CreateCitizenshipUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.CITIZENSHIP)
    private readonly citizenshipRepository: CitizenShipRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateCitizenShipCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<CitizenShip> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_CITIZENSHIP,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_CITIZENSHIP,
          CONSTANTS_DATABASE_MODELS.CITIZENSHIP,
          userId,
          dto,
          requestInfo,
          `Created new citizenship: ${dto.desc1}`,
          `Failed to create citizenship: ${dto.desc1}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Create the citizenship
            const citizenship = await this.citizenshipRepository.create(
              new CitizenShip(dto),
              manager,
            );

            return citizenship;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
