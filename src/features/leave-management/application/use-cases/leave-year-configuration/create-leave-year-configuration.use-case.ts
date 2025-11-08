import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CreateLeaveYearConfigurationCommand } from '@features/leave-management/application/commands/leave-year-configuration/create-leave-year-configuration.command';
import { LeaveYearConfigurationRepository } from '@features/leave-management/domain/repositories/leave-year-configuration.repository';
import { LeaveYearConfiguration } from '@features/leave-management/domain/models/leave-year-configuration.model';
import {
  BadRequestException,
  NotFoundException,
} from '@features/shared/exceptions/shared';
import { generateLeaveYearIdentifier } from '@features/leave-management/infrastructure/utils/leave-year.util';

@Injectable()
export class CreateLeaveYearConfigurationUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_YEAR_CONFIGURATION)
    private readonly leaveYearConfigurationRepository: LeaveYearConfigurationRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateLeaveYearConfigurationCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<LeaveYearConfiguration> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_LEAVE_YEAR_CONFIGURATION,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_LEAVE_YEAR_CONFIGURATION,
          CONSTANTS_DATABASE_MODELS.LEAVE_YEAR_CONFIGURATION,
          userId,
          dto,
          requestInfo,
          `Created leave year configuration for period ${dto.cutoffStartDate} to ${dto.cutoffEndDate}`,
          `Failed to create leave year configuration`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate date range
            const startDate = new Date(dto.cutoffStartDate);
            const endDate = new Date(dto.cutoffEndDate);

            if (isNaN(startDate.getTime())) {
              throw new BadRequestException('Invalid cutoff start date');
            }

            if (isNaN(endDate.getTime())) {
              throw new BadRequestException('Invalid cutoff end date');
            }

            if (endDate <= startDate) {
              throw new BadRequestException(
                'Cutoff end date must be after cutoff start date',
              );
            }

            // Generate leave year identifier
            const year = generateLeaveYearIdentifier(startDate, endDate);

            // Check if configuration with this year already exists
            const existingConfig =
              await this.leaveYearConfigurationRepository.findByYear(
                year,
                manager,
              );

            if (existingConfig) {
              throw new BadRequestException(
                `Leave year configuration already exists for year ${year}`,
              );
            }

            // Create the configuration
            const configuration = await this.leaveYearConfigurationRepository.create(
              new LeaveYearConfiguration({
                cutoffStartDate: startDate,
                cutoffEndDate: endDate,
                year,
                remarks: dto.remarks,
                isActive: true,
              }),
              manager,
            );

            return configuration;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}

