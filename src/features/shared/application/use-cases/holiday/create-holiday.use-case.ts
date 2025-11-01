import { Holiday } from '@features/shared/domain/models/holiday.model';
import { HolidayRepository } from '@features/shared/domain/repositories/holiday.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CreateHolidayCommand } from '@features/shared/application/commands/holiday/create-holiday.command';
import { BadRequestException } from '@features/shared/exceptions/shared';

@Injectable()
export class CreateHolidayUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.HOLIDAY)
    private readonly holidayRepository: HolidayRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateHolidayCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Holiday> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_HOLIDAY,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_HOLIDAY,
          CONSTANTS_DATABASE_MODELS.HOLIDAY,
          userId,
          dto,
          requestInfo,
          `Created new holiday: ${dto.name}`,
          `Failed to create holiday: ${dto.name}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Convert date if string
            let date = dto.date instanceof Date ? dto.date : new Date(dto.date);

            // Validate date
            if (isNaN(date.getTime())) {
              throw new BadRequestException('Invalid date provided');
            }

            // Check for duplicate holiday on same date
            const existingHolidays =
              await this.holidayRepository.findByDateRange(date, date, manager);

            if (existingHolidays.length > 0) {
              throw new BadRequestException(
                `Holiday already exists on ${date.toISOString().split('T')[0]}`,
              );
            }

            // Create the holiday - pass date as string so PostgreSQL treats it as date, not timestamp
            const holiday = await this.holidayRepository.create(
              new Holiday({
                name: dto.name,
                date: date,
                description: dto.description,
              }),
              manager,
            );

            return holiday;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
