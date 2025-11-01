import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { NotFoundException } from '@features/shared/exceptions/shared';
import { ActivityLogRepository } from '@features/shared/domain/repositories/activity-log.repository';
import { ActivityLog } from '@features/shared/domain/models/activitylog.model';

@Injectable()
export class FindEmployeeByIdUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE)
    private readonly employeeRepository: EmployeeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ACTIVITYLOGS)
    private readonly activityLogRepository: ActivityLogRepository,
  ) {}

  async execute(
    id: number,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ) {
    const startTime = Date.now();

    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.FIND_EMPLOYEE_BY_ID,
      async (manager) => {
        try {
          // Retrieve the employee
          const employee = await this.employeeRepository.findById(id, manager);

          if (!employee) {
            throw new NotFoundException('Employee not found');
          }

          const duration = Date.now() - startTime;

          // Log the successful find
          await this.activityLogRepository.create(
            new ActivityLog(
              CONSTANTS_LOG_ACTION.FIND_EMPLOYEE_BY_ID,
              CONSTANTS_DATABASE_MODELS.EMPLOYEE,
              userId,
              {
                details: JSON.stringify({
                  employeeId: id,
                  employeeName: `${employee.fname} ${employee.lname}`,
                }),
                description: `Retrieved employee: ${employee.fname} ${employee.lname}`,
                ipAddress: requestInfo?.ipAddress,
                userAgent: requestInfo?.userAgent,
                sessionId: requestInfo?.sessionId,
                username: requestInfo?.username,
                isSuccess: true,
                statusCode: 200,
                duration,
                createdBy: userId,
              },
            ),
            manager,
          );

          return employee;
        } catch (error) {
          const duration = Date.now() - startTime;

          // Log the failed find
          await this.activityLogRepository.create(
            new ActivityLog(
              CONSTANTS_LOG_ACTION.FIND_EMPLOYEE_BY_ID,
              CONSTANTS_DATABASE_MODELS.EMPLOYEE,
              userId,
              {
                details: JSON.stringify({ employeeId: id }),
                description: `Failed to find employee with ID: ${id}`,
                ipAddress: requestInfo?.ipAddress,
                userAgent: requestInfo?.userAgent,
                sessionId: requestInfo?.sessionId,
                username: requestInfo?.username,
                isSuccess: false,
                errorMessage:
                  error instanceof Error ? error.message : 'Unknown error',
                statusCode: 404,
                duration,
                createdBy: userId,
              },
            ),
            manager,
          );

          throw error;
        }
      },
    );
  }
}
