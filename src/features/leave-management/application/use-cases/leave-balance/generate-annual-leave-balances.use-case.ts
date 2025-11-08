import { LeavePolicyRepository } from '@features/leave-management/domain/repositories/leave-policy.repository';
import { LeaveBalanceRepository } from '@features/leave-management/domain/repositories/leave-balance.repository';
import { LeaveYearConfigurationRepository } from '@features/leave-management/domain/repositories/leave-year-configuration.repository';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';
import { LeavePolicy } from '@features/leave-management/domain/models/leave-policy.model';
import { LeaveBalance } from '@features/leave-management/domain/models/leave-balance.model';
import { EnumLeaveBalanceStatus } from '@features/leave-management/domain/enum/leave-balance-status.enum';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import {
  BadRequestException,
  NotFoundException,
} from '@features/shared/exceptions/shared';

export interface GenerateAnnualLeaveBalancesCommand {
  year: string; // Leave year identifier (e.g., "2023-2024")
  forceRegenerate?: boolean; // If true, will regenerate even if balances already exist
}

export interface SkippedEmployee {
  employeeId: number;
  employeeName: string;
  leaveType: string;
  reason: 'ineligible' | 'balance_already_exists';
  details?: string; // Additional details like eligibility reason
}

@Injectable()
export class GenerateAnnualLeaveBalancesUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_POLICY)
    private readonly leavePolicyRepository: LeavePolicyRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_BALANCE)
    private readonly leaveBalanceRepository: LeaveBalanceRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_YEAR_CONFIGURATION)
    private readonly leaveYearConfigurationRepository: LeaveYearConfigurationRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE)
    private readonly employeeRepository: EmployeeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    command: GenerateAnnualLeaveBalancesCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<{
    generatedCount: number;
    skippedCount: number;
    skippedEmployees: SkippedEmployee[];
  }> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.GENERATE_ANNUAL_LEAVE_BALANCES,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.GENERATE_ANNUAL_LEAVE_BALANCES,
          CONSTANTS_DATABASE_MODELS.LEAVE_BALANCE,
          userId,
          command,
          requestInfo,
          `Generated annual leave balances for year: ${command.year}`,
          `Failed to generate annual leave balances for year: ${command.year}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            let generatedCount = 0;
            let skippedCount = 0;
            const skippedEmployees: SkippedEmployee[] = [];

            // Step 3: Retrieve all active leave policies
            const activePolicies =
              await this.leavePolicyRepository.retrieveActivePolicies(manager);

            if (activePolicies.length === 0) {
              throw new BadRequestException('No active leave policies found');
            }

            // Step 4: Retrieve all active employees
            const activeEmployees: any =
              await this.employeeRepository.retrieveActiveEmployees(manager);

            if (activeEmployees.length === 0) {
              throw new NotFoundException('No active employees found');
            }

            // Get the cutoff configuration for the leave year
            const cutoffConfig =
              await this.leaveYearConfigurationRepository.findByYear(
                command.year,
                manager,
              );
            if (!cutoffConfig) {
              throw new NotFoundException(
                `Leave year configuration not found for year ${command.year}`,
              );
            }

            // Get all configurations to find previous year
            const allConfigs =
              await this.leaveYearConfigurationRepository.findAll(manager);
            const currentConfigIndex = allConfigs.findIndex(
              (c) => c.year === command.year,
            );
            let previousYear: string | null = null;
            if (currentConfigIndex > 0) {
              previousYear = allConfigs[currentConfigIndex - 1].year;
            }

            // Step 5: For each employee, loop through each active leave policy
            for (const employee of activeEmployees) {
              for (const policy of activePolicies) {
                const hireDate = new Date(employee.hiredate);
                // Check eligibility using cutoff start date as reference
                const referenceDate = new Date(cutoffConfig.cutoffStartDate);
                const eligibilityCheck = policy.isEmployeeEligible(
                  hireDate,
                  employee.empstatus || '',
                  referenceDate,
                );

                if (!eligibilityCheck.eligible) {
                  skippedCount++;
                  skippedEmployees.push({
                    employeeId: employee.id!,
                    employeeName: this.getEmployeeName(employee),
                    leaveType: policy.leaveType || 'Unknown Leave Type',
                    reason: 'ineligible',
                    details:
                      eligibilityCheck.reason ||
                      'Employee is not eligible for this leave type',
                  });
                  continue; // Skip creating balance for ineligible employees
                }

                // Check if balance already exists for this employee, leave type, and year
                const existingBalance =
                  await this.leaveBalanceRepository.findByLeaveType(
                    employee.id!,
                    policy.leaveTypeId,
                    command.year,
                    manager,
                  );

                // Skip if balance already exists and forceRegenerate is false
                if (existingBalance && !command.forceRegenerate) {
                  skippedCount++;
                  skippedEmployees.push({
                    employeeId: employee.id!,
                    employeeName: this.getEmployeeName(employee),
                    leaveType: policy.leaveType || 'Unknown Leave Type',
                    reason: 'balance_already_exists',
                    details: `Leave balance already exists for year ${command.year}`,
                  });
                  continue;
                }

                // Step 6: Check if a previous year leave balance exists for the same employee and leave type
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

                // Step 8: Create a new leave balance record with computed values
                const newLeaveBalance = new LeaveBalance({
                  employeeId: employee.id!,
                  leaveTypeId: policy.leaveTypeId,
                  leaveType: policy.leaveType,
                  policyId: policy.id!,
                  year: command.year,
                  beginningBalance: earnedDays + carryOverDays,
                  earned: earnedDays,
                  used: 0,
                  carriedOver: carryOverDays,
                  encashed: 0,
                  remaining: earnedDays + carryOverDays,
                  lastTransactionDate: new Date(),
                  status: EnumLeaveBalanceStatus.OPEN,
                  remarks: `Auto-generated annual leave balance for ${command.year}`,
                  isActive: true,
                });

                await this.leaveBalanceRepository.create(
                  newLeaveBalance,
                  manager,
                );
                generatedCount++;
              }
            }

            return { generatedCount, skippedCount, skippedEmployees };
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

  /**
   * Construct employee full name from employee object
   */
  private getEmployeeName(employee: any): string {
    const parts: string[] = [];
    if (employee.fname) parts.push(employee.fname);
    if (employee.mname) parts.push(employee.mname);
    if (employee.lname) parts.push(employee.lname);
    if (employee.suffix) parts.push(employee.suffix);
    return parts.length > 0 ? parts.join(' ') : `Employee #${employee.id}`;
  }
}
