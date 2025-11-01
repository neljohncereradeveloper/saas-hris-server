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
import { UpdateBarangayCommand } from '@features/201-files/application/commands/barangay/update-barangay.command';
import { Barangay } from '@features/201-files/domain/models/barangay.model';
import { BarangayRepository } from '@features/201-files/domain/repositories/barangay.repository';

@Injectable()
export class UpdateBarangayUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.BARANGAY)
    private readonly barangayRepository: BarangayRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateBarangayCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Barangay | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_BARANGAY,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_BARANGAY,
          CONSTANTS_DATABASE_MODELS.BARANGAY,
          userId,
          { id, dto },
          requestInfo,
          `Updated barangay: ${dto.desc1}`,
          `Failed to update barangay with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate barangay existence
            const barangayResult = await this.barangayRepository.findById(
              id,
              manager,
            );

            if (!barangayResult) {
              throw new NotFoundException('Barangay not found');
            }

            // Update the barangay
            const updateSuccessfull = await this.barangayRepository.update(
              id,
              new Barangay(dto),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('Barangay update failed');
            }

            // Retrieve the updated barangay
            const barangay = await this.barangayRepository.findById(
              id,
              manager,
            );

            return barangay!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
