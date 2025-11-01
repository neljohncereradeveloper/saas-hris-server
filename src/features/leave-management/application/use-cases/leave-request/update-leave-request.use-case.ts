import { LeaveRequest } from '@features/leave-management/domain/models/leave-request.model';
import { LeaveRequestRepository } from '@features/leave-management/domain/repositories/leave-request.repository';
import { LeaveBalanceRepository } from '@features/leave-management/domain/repositories/leave-balance.repository';
import { LeaveTypeRepository } from '@features/leave-management/domain/repositories/leave-type.repository';
import { HolidayRepository } from '@features/shared/domain/repositories/holiday.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { UpdateLeaveRequestCommand } from '@features/leave-management/application/commands/leave-request/update-leave-request.command';
import {
  BadRequestException,
  NotFoundException,
} from '@features/shared/exceptions/shared';
import { EnumLeaveRequestStatus } from '@features/leave-management/domain/enum/leave-request-status.enum';
import { EnumLeaveBalanceStatus } from '@features/leave-management/domain/enum/leave-balance-status.enum';
import { formatDate } from '@features/shared/infrastructure/utils/date.util';

@Injectable()
export class UpdateLeaveRequestUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_REQUEST)
    private readonly leaveRequestRepository: LeaveRequestRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_BALANCE)
    private readonly leaveBalanceRepository: LeaveBalanceRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_TYPE)
    private readonly leaveTypeRepository: LeaveTypeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.HOLIDAY)
    private readonly holidayRepository: HolidayRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: UpdateLeaveRequestCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<LeaveRequest> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_LEAVE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_LEAVE,
          CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST,
          userId,
          dto,
          requestInfo,
          `Updated leave request with ID: ${dto.id}`,
          `Failed to update leave request with ID: ${dto.id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate request exists
            const existingRequest = await this.leaveRequestRepository.findById(
              dto.id,
              manager,
            );

            if (!existingRequest) {
              throw new NotFoundException('Leave request not found');
            }

            // Only PENDING requests can be updated
            if (existingRequest.status !== EnumLeaveRequestStatus.PENDING) {
              throw new BadRequestException(
                `Cannot update request. Current status: ${existingRequest.status}. Only PENDING requests can be updated.`,
              );
            }

            // Prepare update data
            const updateData: Partial<LeaveRequest> = {};

            // Handle leave type update
            let leaveTypeId = existingRequest.leaveTypeId;
            let leaveTypeName = existingRequest.leaveType;
            let balanceId = existingRequest.balanceId;

            if (dto.leaveType !== undefined && dto.leaveType !== null) {
              // Validate new leave type exists by name
              const leaveType = await this.leaveTypeRepository.findByName(
                dto.leaveType,
                manager,
              );
              if (!leaveType || !leaveType.isActive) {
                throw new NotFoundException(
                  `Leave type "${dto.leaveType}" not found or inactive`,
                );
              }

              // If leave type is changing, need to find new balance
              if (leaveType.id !== existingRequest.leaveTypeId) {
                // Use updated startDate if dates are being updated, otherwise use existing
                const startDateForYear = dto.startDate
                  ? dto.startDate instanceof Date
                    ? dto.startDate
                    : new Date(dto.startDate)
                  : existingRequest.startDate;
                const year = startDateForYear.getFullYear();

                const newBalance =
                  await this.leaveBalanceRepository.findByLeaveType(
                    existingRequest.employeeId,
                    leaveType.id!,
                    year,
                    manager,
                  );

                if (!newBalance) {
                  throw new NotFoundException(
                    `Leave balance not found for employee ${existingRequest.employeeId}, leave type "${dto.leaveType}", year ${year}`,
                  );
                }

                if (newBalance.status !== EnumLeaveBalanceStatus.OPEN) {
                  throw new BadRequestException(
                    `Cannot change leave type. Balance for "${dto.leaveType}" is closed.`,
                  );
                }

                // Check if new balance has sufficient days
                const requestedDays = existingRequest.totalDays;
                if (newBalance.remaining < requestedDays) {
                  throw new BadRequestException(
                    `Insufficient leave balance for new leave type. Available: ${newBalance.remaining} days, Requested: ${requestedDays} days`,
                  );
                }

                leaveTypeId = leaveType.id!;
                leaveTypeName = leaveType.name;
                balanceId = newBalance.id!;
              } else {
                // Same leave type, just update the name in case it changed
                leaveTypeName = leaveType.name;
              }

              updateData.leaveTypeId = leaveTypeId;
              updateData.leaveType = leaveTypeName;
              updateData.balanceId = balanceId;
            }

            // Handle date updates
            let startDate = existingRequest.startDate;
            let endDate = existingRequest.endDate;
            let totalDays = existingRequest.totalDays;

            // Check if dates are being updated
            const datesUpdated = dto.startDate || dto.endDate;

            if (datesUpdated) {
              // Convert dates if strings
              startDate =
                dto.startDate instanceof Date
                  ? dto.startDate
                  : dto.startDate
                    ? new Date(dto.startDate)
                    : existingRequest.startDate;

              endDate =
                dto.endDate instanceof Date
                  ? dto.endDate
                  : dto.endDate
                    ? new Date(dto.endDate)
                    : existingRequest.endDate;

              // Validate dates
              this.validateDates(startDate, endDate);

              // Calculate total days (use provided totalDays or calculate from dates)
              const isSameDay =
                startDate.toDateString() === endDate.toDateString();

              if (dto.totalDays !== undefined && dto.totalDays !== null) {
                // Use provided totalDays (supports half-days like 0.5, 1.5, etc.)
                totalDays = dto.totalDays;
              } else if (dto.isHalfDay && isSameDay) {
                // Half-day leave: same start and end date
                totalDays = 0.5;
              } else {
                // Auto-calculate from date range (excluding holidays)
                totalDays = await this.calculateTotalDays(
                  startDate,
                  endDate,
                  manager,
                );
              }

              if (totalDays <= 0) {
                throw new BadRequestException(
                  'Invalid date range: total days must be greater than 0',
                );
              }

              // Validate half-day logic: if isHalfDay is true, dates must be the same
              if (dto.isHalfDay && !isSameDay) {
                throw new BadRequestException(
                  'Half-day leave requires start date and end date to be the same',
                );
              }

              // Validate balance if days changed (use the balanceId that might have been updated if leave type changed)
              if (totalDays !== existingRequest.totalDays) {
                const balanceToCheck =
                  balanceId !== existingRequest.balanceId
                    ? await this.leaveBalanceRepository.findById(
                        balanceId,
                        manager,
                      )
                    : await this.leaveBalanceRepository.findById(
                        existingRequest.balanceId,
                        manager,
                      );

                if (!balanceToCheck) {
                  throw new NotFoundException('Leave balance not found');
                }

                if (balanceToCheck.status !== EnumLeaveBalanceStatus.OPEN) {
                  throw new BadRequestException(
                    'Cannot update request. Balance is closed.',
                  );
                }

                if (balanceToCheck.remaining < totalDays) {
                  throw new BadRequestException(
                    `Insufficient leave balance. Available: ${balanceToCheck.remaining} days, Requested: ${totalDays} days`,
                  );
                }
              }

              // Check for overlapping leave requests
              const overlappingRequests =
                await this.leaveRequestRepository.findOverlappingRequests(
                  existingRequest.employeeId,
                  startDate,
                  endDate,
                  dto.id,
                  manager,
                );

              if (overlappingRequests.length > 0) {
                const overlappingDates = overlappingRequests
                  .map(
                    (req) =>
                      `${req.leaveType} (${formatDate(req.startDate)} - ${formatDate(req.endDate)})`,
                  )
                  .join(', ');

                throw new BadRequestException(
                  `Leave request overlaps with existing request(s): ${overlappingDates}`,
                );
              }

              updateData.startDate = startDate;
              updateData.endDate = endDate;
              updateData.totalDays = totalDays;
            } else if (dto.totalDays !== undefined && dto.totalDays !== null) {
              // Only totalDays is being updated (dates unchanged)
              totalDays = dto.totalDays;

              if (totalDays <= 0) {
                throw new BadRequestException(
                  'Total days must be greater than 0',
                );
              }

              // Validate balance if days changed (use the balanceId that might have been updated if leave type changed)
              if (totalDays !== existingRequest.totalDays) {
                const balanceToCheck =
                  balanceId !== existingRequest.balanceId
                    ? await this.leaveBalanceRepository.findById(
                        balanceId,
                        manager,
                      )
                    : await this.leaveBalanceRepository.findById(
                        existingRequest.balanceId,
                        manager,
                      );

                if (!balanceToCheck) {
                  throw new NotFoundException('Leave balance not found');
                }

                if (balanceToCheck.status !== EnumLeaveBalanceStatus.OPEN) {
                  throw new BadRequestException(
                    'Cannot update request. Balance is closed.',
                  );
                }

                if (balanceToCheck.remaining < totalDays) {
                  throw new BadRequestException(
                    `Insufficient leave balance. Available: ${balanceToCheck.remaining} days, Requested: ${totalDays} days`,
                  );
                }
              }

              updateData.totalDays = totalDays;
            }

            // Handle reason update
            if (dto.reason !== undefined) {
              updateData.reason = dto.reason;
            }

            // Check if there are any updates
            if (Object.keys(updateData).length === 0) {
              throw new BadRequestException('No fields to update');
            }

            // Update the request
            const updateSuccess = await this.leaveRequestRepository.update(
              dto.id,
              updateData,
              manager,
            );

            if (!updateSuccess) {
              throw new BadRequestException('Failed to update leave request');
            }

            // Return updated request
            const updatedRequest = await this.leaveRequestRepository.findById(
              dto.id,
              manager,
            );

            if (!updatedRequest) {
              throw new NotFoundException('Updated request not found');
            }

            return updatedRequest;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }

  /**
   * Validate request dates
   */
  private validateDates(startDate: Date, endDate: Date): void {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      throw new BadRequestException('Start date cannot be before today');
    }

    if (start > end) {
      throw new BadRequestException(
        'Start date must be before or equal to end date',
      );
    }
  }

  /**
   * Calculate total days between start and end date (inclusive)
   * Excludes holidays from the calculation
   */
  private async calculateTotalDays(
    startDate: Date,
    endDate: Date,
    manager: any,
  ): Promise<number> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Calculate total calendar days (inclusive)
    const diffTime = end.getTime() - start.getTime();
    const calendarDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Fetch holidays in the date range
    const holidays = await this.holidayRepository.findByDateRange(
      start,
      end,
      manager,
    );

    // Exclude holidays from total days
    const totalDays = calendarDays - holidays.length;

    return Math.max(0, totalDays); // Ensure non-negative
  }
}
