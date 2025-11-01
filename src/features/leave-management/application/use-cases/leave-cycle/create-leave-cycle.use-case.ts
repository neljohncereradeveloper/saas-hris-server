import { LeaveCycle } from '@features/leave-management/domain/models/leave-cycle.model';
import { LeaveCycleRepository } from '@features/leave-management/domain/repositories/leave-cycle.repository';
import { LeaveTypeRepository } from '@features/leave-management/domain/repositories/leave-type.repository';
import { LeavePolicyRepository } from '@features/leave-management/domain/repositories/leave-policy.repository';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';
import { EnumLeaveCycleStatus } from '@features/leave-management/domain/enum/leave-cycle-status.enum';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CreateLeaveCycleCommand } from '@features/leave-management/application/commands/leave-cycle/create-leave-cycle.command';
import {
  BadRequestException,
  NotFoundException,
} from '@features/shared/exceptions/shared';

@Injectable()
export class CreateLeaveCycleUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_CYCLE)
    private readonly leaveCycleRepository: LeaveCycleRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_TYPE)
    private readonly leaveTypeRepository: LeaveTypeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_POLICY)
    private readonly leavePolicyRepository: LeavePolicyRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE)
    private readonly employeeRepository: EmployeeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    command: CreateLeaveCycleCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<LeaveCycle> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_LEAVE_CYCLE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_LEAVE_CYCLE,
          CONSTANTS_DATABASE_MODELS.LEAVE_CYCLE,
          userId,
          command,
          requestInfo,
          `Created new leave cycle for employee ${command.employeeId}, leave type "${command.leaveType}"`,
          `Failed to create leave cycle for employee ${command.employeeId}, leave type "${command.leaveType}"`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate employee exists
            const employee = await this.employeeRepository.findById(
              command.employeeId,
              manager,
            );
            if (!employee) {
              throw new NotFoundException('Employee not found');
            }

            // Validate leave type exists by name
            const leaveType = await this.leaveTypeRepository.findByName(
              command.leaveType,
              manager,
            );
            if (!leaveType || !leaveType.isActive) {
              throw new NotFoundException(
                `Leave type "${command.leaveType}" not found or inactive`,
              );
            }

            // Determine base year (use provided year or current year)
            const baseYear = command.year || new Date().getFullYear();

            // Get active leave policy for the leave type
            const activePolicy =
              await this.leavePolicyRepository.getActivePolicy(leaveType.id!);
            if (!activePolicy) {
              throw new BadRequestException(
                `No active leave policy found for leave type ${leaveType.name}`,
              );
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
                (baseYear - baseStartYear) / activePolicy.cycleLengthYears,
              );

              // Calculate the start year of the cycle containing baseYear
              // Example: baseStartYear=2013, cycleLengthYears=5, cycleIndex=2
              // cycleStartYear = 2013 + (2 * 5) = 2023
              cycleStartYear =
                baseStartYear + cycleIndex * activePolicy.cycleLengthYears;

              // Calculate the end year of the cycle (inclusive)
              // Example: 2023 + 5 = 2028 (covering 2023, 2024, 2025, 2026, 2027, 2028)
              cycleEndYear = cycleStartYear + activePolicy.cycleLengthYears;
            } else {
              // If baseYear is before baseStartYear, use the first cycle starting at baseStartYear
              cycleStartYear = baseStartYear;
              cycleEndYear = baseStartYear + activePolicy.cycleLengthYears;
            }

            // Check if an overlapping cycle already exists for this employee and leave type
            // This checks for any cycle (active or closed) that overlaps with the calculated year range
            const overlappingCycle =
              await this.leaveCycleRepository.findOverlappingCycle(
                command.employeeId,
                leaveType.id!,
                cycleStartYear,
                cycleEndYear,
                manager,
              );
            if (overlappingCycle) {
              const cycleStatus =
                overlappingCycle.status === EnumLeaveCycleStatus.ACTIVE
                  ? 'active'
                  : 'completed';
              throw new BadRequestException(
                `A ${cycleStatus} cycle already exists for employee ${employee.fname.toUpperCase()} ${employee.mname?.toUpperCase()} ${employee.lname.toUpperCase()}, leave type ${leaveType.name} covering years ${overlappingCycle.cycleStartYear}-${overlappingCycle.cycleEndYear}`,
              );
            }

            // Create the leave cycle
            const leaveCycle = await this.leaveCycleRepository.create(
              new LeaveCycle({
                employeeId: command.employeeId,
                leaveTypeId: leaveType.id!,
                leaveType: leaveType.name,
                cycleStartYear,
                cycleEndYear,
                totalCarried: 0,
                status: EnumLeaveCycleStatus.ACTIVE,
                isActive: true,
              }),
              manager,
            );

            return leaveCycle;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
