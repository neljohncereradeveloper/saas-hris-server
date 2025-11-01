import { Injectable, Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { HolidayRepository } from '@features/shared/domain/repositories/holiday.repository';
import { Holiday } from '@features/shared/domain/models/holiday.model';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';

@Injectable()
export class FindHolidaysByDateRangeUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.HOLIDAY)
    private readonly holidayRepository: HolidayRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    startDate: Date | string,
    endDate: Date | string,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Holiday[]> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.FIND_HOLIDAYS_BY_DATE_RANGE,
      async (manager) => {
        const start = startDate instanceof Date ? startDate : new Date(startDate);
        const end = endDate instanceof Date ? endDate : new Date(endDate);

        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.FIND_HOLIDAYS_BY_DATE_RANGE,
          CONSTANTS_DATABASE_MODELS.HOLIDAY,
          userId,
          { startDate: start, endDate: end },
          requestInfo,
          `Found holidays between ${start.toISOString().split('T')[0]} and ${end.toISOString().split('T')[0]}`,
          `Failed to find holidays between ${start.toISOString().split('T')[0]} and ${end.toISOString().split('T')[0]}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            return await this.holidayRepository.findByDateRange(
              start,
              end,
              manager,
            );
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}

