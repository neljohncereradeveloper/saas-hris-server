import { LeaveRequest } from '@features/leave-management/domain/models/leave-request.model';
import { LeaveRequestRepository } from '@features/leave-management/domain/repositories/leave-request.repository';
import { LeaveBalanceRepository } from '@features/leave-management/domain/repositories/leave-balance.repository';
import { LeaveTypeRepository } from '@features/leave-management/domain/repositories/leave-type.repository';
import { LeavePolicyRepository } from '@features/leave-management/domain/repositories/leave-policy.repository';
import { HolidayRepository } from '@features/shared/domain/repositories/holiday.repository';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CreateLeaveRequestCommand } from '@features/leave-management/application/commands/leave-request/create-leave-request.command';
import {
  BadRequestException,
  NotFoundException,
} from '@features/shared/exceptions/shared';
import { EnumLeaveRequestStatus } from '@features/leave-management/domain/enum/leave-request-status.enum';
import { EnumLeaveBalanceStatus } from '@features/leave-management/domain/enum/leave-balance-status.enum';
import { formatDate } from '@features/shared/infrastructure/utils/date.util';

@Injectable()
export class CreateLeaveRequestUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_REQUEST)
    private readonly leaveRequestRepository: LeaveRequestRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_BALANCE)
    private readonly leaveBalanceRepository: LeaveBalanceRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_TYPE)
    private readonly leaveTypeRepository: LeaveTypeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_POLICY)
    private readonly leavePolicyRepository: LeavePolicyRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.HOLIDAY)
    private readonly holidayRepository: HolidayRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE)
    private readonly employeeRepository: EmployeeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateLeaveRequestCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<LeaveRequest> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_LEAVE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_LEAVE,
          CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST,
          userId,
          dto,
          requestInfo,
          `Created leave request for employee ${dto.employeeId}`,
          `Failed to create leave request for employee ${dto.employeeId}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate employee exists
            const employee = await this.employeeRepository.findById(
              dto.employeeId,
              manager,
            );
            if (!employee) {
              throw new NotFoundException('Employee not found');
            }

            // Validate leave type exists by name
            const leaveType = await this.leaveTypeRepository.findByName(
              dto.leaveType,
              manager,
            );
            if (!leaveType || !leaveType.isActive) {
              throw new NotFoundException(
                `Leave type "${dto.leaveType}" not found or inactive`,
              );
            }

            // Get the active leave policy for the leave type
            const policy = await this.leavePolicyRepository.getActivePolicy(
              leaveType.id!,
            );

            if (!policy) {
              throw new NotFoundException(
                `Active leave policy not found for leave type "${dto.leaveType}"`,
              );
            }

            // Convert dates if strings - ensure they are valid Date objects
            let startDate: Date;
            let endDate: Date;

            if (dto.startDate instanceof Date) {
              if (isNaN(dto.startDate.getTime())) {
                throw new BadRequestException('Invalid start date');
              }
              startDate = dto.startDate;
            } else if (dto.startDate) {
              startDate = new Date(dto.startDate);
              if (isNaN(startDate.getTime())) {
                throw new BadRequestException('Invalid start date');
              }
            } else {
              throw new BadRequestException('Start date is required');
            }

            if (dto.endDate instanceof Date) {
              if (isNaN(dto.endDate.getTime())) {
                throw new BadRequestException('Invalid end date');
              }
              endDate = dto.endDate;
            } else if (dto.endDate) {
              endDate = new Date(dto.endDate);
              if (isNaN(endDate.getTime())) {
                throw new BadRequestException('Invalid end date');
              }
            } else {
              throw new BadRequestException('End date is required');
            }

            // Validate dates
            this.validateDates(startDate, endDate);

            // Check eligibility based on hire date and employee status
            const eligibilityCheck = policy.isEmployeeEligible(
              employee.hireDate,
              employee.employeeStatus || '',
              startDate,
            );

            if (!eligibilityCheck.eligible) {
              throw new BadRequestException(
                `Employee is not eligible for ${dto.leaveType}. ${eligibilityCheck.reason}`,
              );
            }

            // Calculate total days (use provided totalDays or calculate from dates)
            let totalDays: number;
            let holidays: any[] = [];

            // Check if it's a half-day request (startDate === endDate and isHalfDay flag)
            const isSameDay =
              startDate.toDateString() === endDate.toDateString();

            if (dto.totalDays !== undefined && dto.totalDays !== null) {
              // Use provided totalDays (supports half-days like 0.5, 1.5, etc.)
              totalDays = dto.totalDays;
              // Still need to check holidays for validation
              holidays = await this.holidayRepository.findByDateRange(
                startDate,
                endDate,
                manager,
              );
            } else if (dto.isHalfDay && isSameDay) {
              // Half-day leave: same start and end date
              totalDays = 0.5;
              // Check if the single date is a holiday
              holidays = await this.holidayRepository.findByDateRange(
                startDate,
                endDate,
                manager,
              );
            } else {
              // Auto-calculate from date range (excluding holidays)
              totalDays = await this.calculateTotalDays(
                startDate,
                endDate,
                manager,
              );
              // Fetch holidays for validation
              holidays = await this.holidayRepository.findByDateRange(
                startDate,
                endDate,
                manager,
              );
            }

            // Validate totalDays
            if (totalDays <= 0) {
              // Check if all days are holidays
              const calendarDays = this.getCalendarDays(startDate, endDate);
              if (holidays.length >= calendarDays) {
                throw new BadRequestException(
                  'All dates in the leave request period are holidays. Cannot create leave request for holiday dates only.',
                );
              }
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

            // Get year from start date
            const year = startDate.getFullYear();

            // Retrieve and validate leave balance
            const balance = await this.leaveBalanceRepository.findByLeaveType(
              dto.employeeId,
              leaveType.id!,
              year,
              manager,
            );

            if (!balance) {
              throw new NotFoundException(
                `Leave balance not found for employee ${dto.employeeId}, leave type "${dto.leaveType}", year ${year}`,
              );
            }

            if (balance.status !== EnumLeaveBalanceStatus.OPEN) {
              throw new BadRequestException(
                'Leave balance is closed. Cannot create request for closed balance.',
              );
            }

            if (balance.remaining < totalDays) {
              throw new BadRequestException(
                `Insufficient leave balance. Available: ${balance.remaining} days, Requested: ${totalDays} days`,
              );
            }

            // Check for overlapping leave requests
            const overlappingRequests =
              await this.leaveRequestRepository.findOverlappingRequests(
                dto.employeeId,
                startDate,
                endDate,
                undefined,
                manager,
              );

            console.log('overlappingRequests : ', overlappingRequests);

            if (overlappingRequests.length > 0) {
              const overlappingDates = overlappingRequests
                .map(
                  (req) =>
                    `${req.leaveType} (${formatDate(new Date(req.startDate))} - ${formatDate(new Date(req.endDate))})`,
                )
                .join(', ');

              throw new BadRequestException(
                `Leave request overlaps with existing request(s): ${overlappingDates}`,
              );
            }

            // Create leave request
            const leaveRequest = await this.leaveRequestRepository.create(
              new LeaveRequest({
                employeeId: dto.employeeId,
                leaveTypeId: leaveType.id!,
                leaveType: leaveType.name,
                startDate: startDate,
                endDate: endDate,
                totalDays: totalDays,
                reason: dto.reason || '',
                balanceId: balance.id!,
                status: EnumLeaveRequestStatus.PENDING,
                approvalDate: new Date(), // Will be set to null in repository if PENDING
                approvalBy: 0,
                remarks: '',
                isActive: true,
              }),
              manager,
            );

            return leaveRequest;
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
    // Extract date components for comparison
    // transformDateString creates UTC dates from YYYY-MM-DD strings,
    // so we need to use UTC methods to get the correct date components
    const startDateStr = this.getDateStringForComparison(startDate);
    const endDateStr = this.getDateStringForComparison(endDate);
    const todayDateStr = this.getDateStringForComparison(new Date());

    // Compare date strings (YYYY-MM-DD format) to avoid timezone issues
    if (startDateStr < todayDateStr) {
      throw new BadRequestException('Start date cannot be before today');
    }

    if (startDateStr > endDateStr) {
      throw new BadRequestException(
        'Start date must be before or equal to end date',
      );
    }
  }

  /**
   * Get date string in YYYY-MM-DD format for comparison
   * Handles both UTC dates (from transformDateString) and local dates
   */
  private getDateStringForComparison(date: Date): string {
    // Check if date is likely from transformDateString (YYYY-MM-DD string)
    // transformDateString creates dates at UTC midnight, so check if it's midnight UTC
    const isMidnightUTC =
      date.getUTCHours() === 0 &&
      date.getUTCMinutes() === 0 &&
      date.getUTCSeconds() === 0 &&
      date.getUTCMilliseconds() === 0;

    if (isMidnightUTC) {
      // Date is from transformDateString - use UTC methods to get the calendar date
      const year = String(date.getUTCFullYear());
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else {
      // Date is local (like "today") - use local methods to get the calendar date
      const year = String(date.getFullYear());
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
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
    const result = await this.calculateTotalDaysWithHolidays(
      startDate,
      endDate,
      manager,
    );
    return result.totalDays;
  }

  /**
   * Calculate total days between start and end date (inclusive) with holidays
   * Returns both totalDays and holidays array
   */
  private async calculateTotalDaysWithHolidays(
    startDate: Date,
    endDate: Date,
    manager: any,
  ): Promise<{ totalDays: number; holidays: any[] }> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Calculate total calendar days (inclusive)
    const calendarDays = this.getCalendarDays(start, end);

    // Fetch holidays in the date range
    const holidays = await this.holidayRepository.findByDateRange(
      start,
      end,
      manager,
    );

    // Exclude holidays from total days
    const totalDays = Math.max(0, calendarDays - holidays.length);

    return { totalDays, holidays };
  }

  /**
   * Calculate calendar days between start and end date (inclusive)
   */
  private getCalendarDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
}
