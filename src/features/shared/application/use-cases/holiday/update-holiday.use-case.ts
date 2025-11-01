import { Holiday } from '@features/shared/domain/models/holiday.model';
import { HolidayRepository } from '@features/shared/domain/repositories/holiday.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { UpdateHolidayCommand } from '@features/shared/application/commands/holiday/update-holiday.command';
import {
  BadRequestException,
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

@Injectable()
export class UpdateHolidayUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.HOLIDAY)
    private readonly holidayRepository: HolidayRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: UpdateHolidayCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<Holiday | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_HOLIDAY,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_HOLIDAY,
          CONSTANTS_DATABASE_MODELS.HOLIDAY,
          userId,
          dto,
          requestInfo,
          `Updated holiday with ID: ${dto.id}`,
          `Failed to update holiday with ID: ${dto.id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate holiday exists
            const existingHoliday = await this.holidayRepository.findById(
              dto.id,
              manager,
            );

            if (!existingHoliday) {
              throw new NotFoundException('Holiday not found');
            }

            // Prepare update data
            const updateData: Partial<Holiday> = {};

            if (dto.name !== undefined) {
              updateData.name = dto.name;
            }

            if (dto.date !== undefined) {
              // Convert date if string
              let date =
                dto.date instanceof Date ? dto.date : new Date(dto.date);

              // Validate date
              if (isNaN(date.getTime())) {
                throw new BadRequestException('Invalid date provided');
              }

              // Check for duplicate holiday on same date (excluding current holiday)
              const existingHolidays =
                await this.holidayRepository.findByDateRange(
                  date,
                  date,
                  manager,
                );

              const duplicateExists = existingHolidays.some(
                (h) => h.id !== dto.id,
              );

              if (duplicateExists) {
                throw new BadRequestException(
                  `Another holiday already exists on ${date.toISOString().split('T')[0]}`,
                );
              }

              // Format date as string for PostgreSQL (to avoid timezone conversion)
              updateData.date = date;
            }

            if (dto.description !== undefined) {
              updateData.description = dto.description;
            }

            // Check if there are any updates
            if (Object.keys(updateData).length === 0) {
              throw new BadRequestException('No fields to update');
            }

            // Update the holiday
            const updateSuccess = await this.holidayRepository.update(
              dto.id,
              updateData,
              manager,
            );

            if (!updateSuccess) {
              throw new SomethinWentWrongException('Failed to update holiday');
            }

            // Retrieve the updated holiday
            const holiday = await this.holidayRepository.findById(
              dto.id,
              manager,
            );

            if (!holiday) {
              return null;
            }

            // Parse returned date and normalize (remove time component)
            return holiday;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
