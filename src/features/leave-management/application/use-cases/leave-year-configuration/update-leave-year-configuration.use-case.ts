import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { UpdateLeaveYearConfigurationCommand } from '@features/leave-management/application/commands/leave-year-configuration/update-leave-year-configuration.command';
import { LeaveYearConfigurationRepository } from '@features/leave-management/domain/repositories/leave-year-configuration.repository';
import {
  BadRequestException,
  NotFoundException,
} from '@features/shared/exceptions/shared';
import { generateLeaveYearIdentifier } from '@features/leave-management/infrastructure/utils/leave-year.util';

@Injectable()
export class UpdateLeaveYearConfigurationUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_YEAR_CONFIGURATION)
    private readonly leaveYearConfigurationRepository: LeaveYearConfigurationRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: UpdateLeaveYearConfigurationCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ) {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_LEAVE_YEAR_CONFIGURATION,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_LEAVE_YEAR_CONFIGURATION,
          CONSTANTS_DATABASE_MODELS.LEAVE_YEAR_CONFIGURATION,
          userId,
          dto,
          requestInfo,
          `Updated leave year configuration ${dto.id}`,
          `Failed to update leave year configuration ${dto.id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Check if configuration exists
            const existingConfig =
              await this.leaveYearConfigurationRepository.findById(
                dto.id,
                manager,
              );

            if (!existingConfig) {
              throw new NotFoundException(
                `Leave year configuration with id ${dto.id} not found`,
              );
            }

            // Prepare update data
            const updateData: any = {};

            if (dto.cutoffStartDate !== undefined) {
              const startDate = new Date(dto.cutoffStartDate);
              if (isNaN(startDate.getTime())) {
                throw new BadRequestException('Invalid cutoff start date');
              }
              updateData.cutoffStartDate = startDate;
            }

            if (dto.cutoffEndDate !== undefined) {
              const endDate = new Date(dto.cutoffEndDate);
              if (isNaN(endDate.getTime())) {
                throw new BadRequestException('Invalid cutoff end date');
              }
              updateData.cutoffEndDate = endDate;
            }

            // Validate date range if both dates are being updated
            if (
              updateData.cutoffStartDate &&
              updateData.cutoffEndDate &&
              updateData.cutoffEndDate <= updateData.cutoffStartDate
            ) {
              throw new BadRequestException(
                'Cutoff end date must be after cutoff start date',
              );
            }

            // If dates changed, regenerate year identifier
            if (updateData.cutoffStartDate || updateData.cutoffEndDate) {
              const finalStartDate =
                updateData.cutoffStartDate || existingConfig.cutoffStartDate;
              const finalEndDate =
                updateData.cutoffEndDate || existingConfig.cutoffEndDate;
              updateData.year = generateLeaveYearIdentifier(
                finalStartDate,
                finalEndDate,
              );

              // Check if new year identifier conflicts with existing configuration
              if (updateData.year !== existingConfig.year) {
                const conflictingConfig =
                  await this.leaveYearConfigurationRepository.findByYear(
                    updateData.year,
                    manager,
                  );
                if (conflictingConfig && conflictingConfig.id !== dto.id) {
                  throw new BadRequestException(
                    `Leave year configuration already exists for year ${updateData.year}`,
                  );
                }
              }
            }

            if (dto.remarks !== undefined) {
              updateData.remarks = dto.remarks;
            }

            if (dto.isActive !== undefined) {
              updateData.isActive = dto.isActive;
            }

            // Update the configuration
            const updatedConfig =
              await this.leaveYearConfigurationRepository.update(
                dto.id,
                updateData,
                manager,
              );

            return updatedConfig;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}

