import { Inject, Injectable } from '@nestjs/common';
import { EmployeeMovementRepository } from '@features/201-files/domain/repositories/employee-movement.repository';
import { EmployeeMovement } from '@features/201-files/domain/models/employee-movement.model';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { NotFoundException } from '@features/shared/exceptions/shared/not-found.exception';
import { SomethinWentWrongException } from '@features/shared/exceptions/shared/something-wentwrong.exception';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { BranchRepository } from '@features/201-files/domain/repositories/branch.repository';
import { DepartmentRepository } from '@features/201-files/domain/repositories/department.repository';
import { JobTitleRepository } from '@features/201-files/domain/repositories/jobtitle.repository';
import { CreateEmployeeMovementCommand } from '../../commands/employee-movement/create-employee-movement.command';
import { EmployeeMovementTypeRepository } from '@features/201-files/domain/repositories/employee-movement-type.repository';

@Injectable()
export class CreateEmployeeMovementUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE_MOVEMENT)
    private readonly employeeMovementRepository: EmployeeMovementRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE)
    private readonly employeeRepository: EmployeeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.BRANCH)
    private readonly branchRepository: BranchRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.DEPARTMENT)
    private readonly departmentRepository: DepartmentRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.JOBTITLE)
    private readonly jobTitleRepository: JobTitleRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE_MOVEMENT_TYPE)
    private readonly employeeMovementTypeRepository: EmployeeMovementTypeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    command: CreateEmployeeMovementCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<EmployeeMovement> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_EMPLOYEE_MOVEMENT,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_EMPLOYEE_MOVEMENT,
          CONSTANTS_DATABASE_MODELS.EMPLOYEE_MOVEMENT,
          userId,
          command,
          requestInfo,
          `Created employee movement for employee ID: ${command.employeeId}`,
          `Failed to create employee movement for employee ID: ${command.employeeId}`,
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

            // Validate employee movement type exists
            const employeeMovementType =
              await this.employeeMovementTypeRepository.findByDescription(
                command.movementType || '',
                manager,
              );
            if (!employeeMovementType) {
              throw new NotFoundException('Employee movement type not found');
            }

            // Validate branch exists
            const branch = await this.branchRepository.findByDescription(
              command.newBranch || '',
              manager,
            );
            if (!branch) {
              throw new NotFoundException('Branch not found');
            }

            // Validate department exists
            const department =
              await this.departmentRepository.findByDescription(
                command.newDepartment || '',
                manager,
              );
            if (!department) {
              throw new NotFoundException('Department not found');
            }

            // Validate job title exists
            const jobTitle = await this.jobTitleRepository.findByDescription(
              command.newJobTitle || '',
              manager,
            );
            if (!jobTitle) {
              throw new NotFoundException('Job title not found');
            }

            // Get current employee details for previous values
            const previousBranchId = employee.branchId;
            const previousDepartmentId = employee.departmentId;
            const previousJobTitleId = employee.jobTitleId;
            const previousAnnualSalary = employee.annualSalary;
            const previousMonthlySalary = employee.monthlySalary;

            // Get new employee details
            const newBranchId = branch.id;
            const newDepartmentId = department.id;
            const newJobTitleId = jobTitle.id;
            const newAnnualSalary = command.newAnnualSalary;
            const newMonthlySalary = command.newMonthlySalary;

            // Create movement record
            const movement = new EmployeeMovement(
              command.employeeId,
              employeeMovementType.id!,
              command.effectiveDate,
              {
                reason: command.reason,
                previousBranchId,
                previousDepartmentId,
                previousJobTitleId,
                previousAnnualSalary,
                previousMonthlySalary,
                newBranchId,
                newDepartmentId,
                newJobTitleId,
                newAnnualSalary,
                newMonthlySalary,
                approvedBy: command.approvedBy,
                approvedDate: command.approvedDate,
                notes: command.notes,
                createdBy: userId,
              },
            );

            const createdMovement =
              await this.employeeMovementRepository.create(movement, manager);

            // Update employee record if movement is effective (past effective date)
            const isEffective = new Date() >= command.effectiveDate;
            if (isEffective) {
              const updateData: any = {};

              if (command.newBranch) updateData.branchId = branch.id;
              if (command.newDepartment)
                updateData.departmentId = department.id;
              if (command.newJobTitle) updateData.jobTitleId = jobTitle.id;
              if (command.newAnnualSalary)
                updateData.annualSalary = command.newAnnualSalary;
              if (command.newMonthlySalary)
                updateData.monthlySalary = command.newMonthlySalary;
              updateData.updatedBy = userId;

              const updateSuccess = await this.employeeRepository.update(
                command.employeeId,
                updateData,
                manager,
              );

              if (!updateSuccess) {
                throw new SomethinWentWrongException(
                  'Failed to update employee record',
                );
              }
            }

            return createdMovement;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
