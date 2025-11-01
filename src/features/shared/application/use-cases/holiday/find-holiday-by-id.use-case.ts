import { Injectable, Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { HolidayRepository } from '@features/shared/domain/repositories/holiday.repository';
import { Holiday } from '@features/shared/domain/models/holiday.model';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';

@Injectable()
export class FindHolidayByIdUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.HOLIDAY)
    private readonly holidayRepository: HolidayRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Holiday | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.FIND_HOLIDAY_BY_ID,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.FIND_HOLIDAY_BY_ID,
          CONSTANTS_DATABASE_MODELS.HOLIDAY,
          userId,
          { id },
          requestInfo,
          `Found holiday with ID: ${id}`,
          `Failed to find holiday with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            return await this.holidayRepository.findById(id, manager);
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}

