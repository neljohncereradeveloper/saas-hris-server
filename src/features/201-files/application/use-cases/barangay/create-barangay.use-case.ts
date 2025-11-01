import { Barangay } from '@features/201-files/domain/models/barangay.model';
import { BarangayRepository } from '@features/201-files/domain/repositories/barangay.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CreateBarangayCommand } from '@features/201-files/application/commands/barangay/create-barangay.command';

@Injectable()
export class CreateBarangayUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.BARANGAY)
    private readonly barangayRepository: BarangayRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateBarangayCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Barangay> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_BARANGAY,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_BARANGAY,
          CONSTANTS_DATABASE_MODELS.BARANGAY,
          userId,
          dto,
          requestInfo,
          `Created new barangay: ${dto.desc1}`,
          `Failed to create barangay: ${dto.desc1}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Create the barangay
            const barangay = await this.barangayRepository.create(
              new Barangay(dto),
              manager,
            );

            return barangay;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
