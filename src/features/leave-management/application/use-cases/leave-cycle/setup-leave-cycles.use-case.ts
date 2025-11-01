import { LeavePolicyRepository } from '@features/leave-management/domain/repositories/leave-policy.repository';
import { LeaveCycleRepository } from '@features/leave-management/domain/repositories/leave-cycle.repository';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';
import { LeaveCycle } from '@features/leave-management/domain/models/leave-cycle.model';
import { EnumLeaveCycleStatus } from '@features/leave-management/domain/enum/leave-cycle-status.enum';
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

export interface SetupLeaveCyclesCommand {
  year?: number; // Optional: if provided, will use this as base year; otherwise uses current year
  forceRegenerate?: boolean; // If true, will regenerate even if cycles already exist
}

@Injectable()
export class SetupLeaveCyclesUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_POLICY)
    private readonly leavePolicyRepository: LeavePolicyRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_CYCLE)
    private readonly leaveCycleRepository: LeaveCycleRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE)
    private readonly employeeRepository: EmployeeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    command: SetupLeaveCyclesCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<{ generatedCount: number; skippedCount: number }> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.SETUP_LEAVE_CYCLES,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.SETUP_LEAVE_CYCLES,
          CONSTANTS_DATABASE_MODELS.LEAVE_CYCLE,
          userId,
          command,
          requestInfo,
          `Setup leave cycles for employees`,
          `Failed to setup leave cycles for employees`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            let generatedCount = 0;
            let skippedCount = 0;

            // Retrieve all active leave policies
            const activePolicies =
              await this.leavePolicyRepository.retrieveActivePolicies(manager);

            if (activePolicies.length === 0) {
              throw new BadRequestException('No active leave policies found');
            }

            // Retrieve all active employees
            const activeEmployees =
              await this.employeeRepository.retrieveActiveEmployees(manager);

            if (activeEmployees.length === 0) {
              throw new NotFoundException('No active employees found');
            }

            // Determine base year (use provided year or current year)
            const baseYear = command.year || new Date().getFullYear();

            // For each employee, loop through each active leave policy
            for (const employee of activeEmployees) {
              for (const policy of activePolicies) {
                // Check if an active cycle already exists for this employee and leave type
                const existingCycle =
                  await this.leaveCycleRepository.getActiveCycle(
                    employee.id!,
                    policy.leaveTypeId,
                    manager,
                  );

                // Skip if cycle already exists and forceRegenerate is false
                if (existingCycle && !command.forceRegenerate) {
                  skippedCount++;
                  continue;
                }

                // Calculate cycle start and end years based on employee start date and policy cycle length
                // Strategy:
                // 1. Start from regularization year (or hire date) as the base
                // 2. Calculate cycles by repeatedly adding cycleLengthYears
                // 3. Find the cycle that contains the current/base year
                // 4. Use that cycle's start and end years

                // Determine employee start year for cycle calculation
                // Priority: regularizationDate > hireDate > baseYear
                let employeeStartYear: number | null = null;

                // First, try to use regularization date
                if (employee.regularizationDate) {
                  employeeStartYear = new Date(
                    employee.regularizationDate,
                  ).getFullYear();
                }
                // If no regularization date, fall back to hire date
                else if (employee.hireDate) {
                  employeeStartYear = new Date(employee.hireDate).getFullYear();
                }

                // Determine the base start year for cycle calculation
                // Use employee start year if available, otherwise use baseYear
                const baseStartYear =
                  employeeStartYear !== null ? employeeStartYear : baseYear;

                // Calculate which cycle contains the baseYear
                // Example: baseStartYear = 2013, cycleLengthYears = 5, baseYear = 2025
                // Cycles calculated from baseStartYear:
                //   Cycle 1: 2013 + 5 = 2018 (2013-2018)
                //   Cycle 2: 2018 + 5 = 2023 (2018-2023)
                //   Cycle 3: 2023 + 5 = 2028 (2023-2028)
                // Year 2025 falls in cycle 3, so start=2023, end=2028

                let cycleStartYear: number;
                let cycleEndYear: number;

                if (baseYear >= baseStartYear) {
                  // Calculate how many cycles have passed since baseStartYear
                  // Cycle index: (baseYear - baseStartYear) / cycleLengthYears
                  // Example: (2025 - 2013) / 5 = 2.4 → Math.floor = 2 (cycle index 2)
                  const cycleIndex = Math.floor(
                    (baseYear - baseStartYear) / policy.cycleLengthYears,
                  );

                  // Calculate the start year of the cycle containing baseYear
                  // Example: baseStartYear=2013, cycleLengthYears=5, cycleIndex=2
                  // cycleStartYear = 2013 + (2 * 5) = 2023
                  cycleStartYear =
                    baseStartYear + cycleIndex * policy.cycleLengthYears;

                  // Calculate the end year of the cycle (inclusive)
                  // Example: 2023 + 5 = 2028 (covering 2023, 2024, 2025, 2026, 2027, 2028)
                  cycleEndYear = cycleStartYear + policy.cycleLengthYears;
                } else {
                  // If baseYear is before baseStartYear, use the first cycle starting at baseStartYear
                  cycleStartYear = baseStartYear;
                  cycleEndYear = baseStartYear + policy.cycleLengthYears;
                }

                // Create the leave cycle
                const leaveCycle = await this.leaveCycleRepository.create(
                  new LeaveCycle({
                    employeeId: employee.id!,
                    leaveTypeId: policy.leaveTypeId,
                    leaveType: policy.leaveType,
                    cycleStartYear,
                    cycleEndYear,
                    totalCarried: 0,
                    status: EnumLeaveCycleStatus.ACTIVE,
                    isActive: true,
                  }),
                  manager,
                );

                generatedCount++;
              }
            }

            return { generatedCount, skippedCount };
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
