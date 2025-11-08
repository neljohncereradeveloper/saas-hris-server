import { LeaveBalance } from '@features/leave-management/domain/models/leave-balance.model';
import { LeaveBalanceRepository } from '@features/leave-management/domain/repositories/leave-balance.repository';
import { LeaveYearConfigurationRepository } from '@features/leave-management/domain/repositories/leave-year-configuration.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CreateLeaveBalanceCommand } from '@features/leave-management/application/commands/leave-balance/create-leave-balance.command';
import { LeaveTypeRepository } from '@features/leave-management/domain/repositories/leave-type.repository';
import {
  BadRequestException,
  NotFoundException,
} from '@features/shared/exceptions/shared';
import { EnumLeaveBalanceStatus } from '@features/leave-management/domain/enum/leave-balance-status.enum';
import { LeavePolicyRepository } from '@features/leave-management/domain/repositories/leave-policy.repository';
import { LeavePolicy } from '@features/leave-management/domain/models/leave-policy.model';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';

@Injectable()
export class CreateLeaveBalanceUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_BALANCE)
    private readonly leaveBalanceRepository: LeaveBalanceRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_TYPE)
    private readonly leaveTypeRepository: LeaveTypeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_POLICY)
    private readonly leavePolicyRepository: LeavePolicyRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_YEAR_CONFIGURATION)
    private readonly leaveYearConfigurationRepository: LeaveYearConfigurationRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE)
    private readonly employeeRepository: EmployeeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateLeaveBalanceCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<LeaveBalance> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_LEAVE_BALANCE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_LEAVE_BALANCE,
          CONSTANTS_DATABASE_MODELS.LEAVE_BALANCE,
          userId,
          dto,
          requestInfo,
          `Created new leave balance for employee ${dto.employeeId}, leave type ${dto.leaveType}, year ${dto.year}`,
          `Failed to create leave balance for employee ${dto.employeeId}, leave type ${dto.leaveType}, year ${dto.year}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            const employee = await this.employeeRepository.findById(
              dto.employeeId,
              manager,
            );
            if (!employee) {
              throw new NotFoundException('Employee not found');
            }
            // Validate leave type existence
            const leaveType = await this.leaveTypeRepository.findByName(
              dto.leaveType,
              manager,
            );
            if (!leaveType) {
              throw new NotFoundException('Leave type not found');
            }

            const policy = await this.leavePolicyRepository.findById(
              dto.policyId,
              manager,
            );
            if (!policy || !policy.isActive) {
              throw new NotFoundException('Invalid or inactive policy');
            }

            // Get the cutoff configuration for the leave year to determine reference date
            const cutoffConfig = await this.leaveYearConfigurationRepository.findByYear(
              dto.year,
              manager,
            );
            if (!cutoffConfig) {
              throw new NotFoundException(
                `Leave year configuration not found for year ${dto.year}`,
              );
            }

            // Use cutoff start date as reference date for eligibility check
            const referenceDate = cutoffConfig.cutoffStartDate;
            const eligibilityCheck = policy.isEmployeeEligible(
              employee.hireDate,
              employee.employeeStatus || '',
              referenceDate,
            );

            if (!eligibilityCheck.eligible) {
              throw new BadRequestException(
                `Employee is not eligible for leave type "${dto.leaveType}" in year ${dto.year}. ${eligibilityCheck.reason}`,
              );
            }

            // Check if a balance already exists for this employee, leave type, and year
            const existingBalance =
              await this.leaveBalanceRepository.findByLeaveType(
                employee.id!,
                policy.leaveTypeId,
                dto.year,
                manager,
              );
            if (existingBalance) {
              throw new BadRequestException(
                `Leave balance already exists for employee ${employee.fname.toUpperCase()} ${employee.mname?.toUpperCase()} ${employee.lname.toUpperCase()}, leave type ${leaveType.name}, year ${dto.year}`,
              );
            }

            // Step 6: Find previous leave year configuration and check for previous balance
            // Get all configurations to find the one that comes before the current one
            const allConfigs = await this.leaveYearConfigurationRepository.findAll(
              manager,
            );
            const currentConfigIndex = allConfigs.findIndex(
              (c) => c.year === dto.year,
            );
            let previousYear: string | null = null;
            if (currentConfigIndex > 0) {
              previousYear = allConfigs[currentConfigIndex - 1].year;
            }

            // Check if a previous year leave balance exists for the same employee and leave type
            let previousYearBalance: LeaveBalance | null = null;
            if (previousYear) {
              previousYearBalance =
                await this.leaveBalanceRepository.findByLeaveType(
                  employee.id!,
                  policy.leaveTypeId,
                  previousYear,
                  manager,
                );
            }

            // Step 7: Calculate carry-over days based on the previous balance and policy rules
            const carryOverDays = this.calculateCarryOverDays(
              previousYearBalance,
              policy,
            );

            // Calculate earned days (annual entitlement from policy)
            const earnedDays = policy.annualEntitlement;

            // Create the leave balance
            const leaveBalance = await this.leaveBalanceRepository.create(
              new LeaveBalance({
                employeeId: employee.id!,
                leaveTypeId: policy.leaveTypeId,
                leaveType: dto.leaveType,
                policyId: policy.id!,
                year: dto.year,
                beginningBalance: earnedDays + carryOverDays,
                earned: earnedDays,
                used: 0,
                carriedOver: carryOverDays,
                encashed: 0,
                remaining: earnedDays + carryOverDays,
                lastTransactionDate: new Date(),
                status: EnumLeaveBalanceStatus.OPEN,
                remarks: `Created leave balance for employee ${dto.employeeId}, leave type ${dto.leaveType}, year ${dto.year}`,
                isActive: true,
              }),
              manager,
            );

            return leaveBalance;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }

  /**
   * Calculate carry-over days based on previous year balance and policy rules
   */
  private calculateCarryOverDays(
    previousBalance: LeaveBalance | null,
    policy: LeavePolicy,
  ): number {
    if (!previousBalance) {
      return 0;
    }

    // Calculate remaining days from previous year
    const remainingDays = previousBalance.remaining;

    // Apply carry limit from policy
    const carryOverDays = Math.min(remainingDays, policy.carryLimit);

    return Math.max(0, carryOverDays);
  }
}
