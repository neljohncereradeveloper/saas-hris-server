import { WorkExp } from '@features/201-files/domain/models/workexp.model';
import { WorkExpRepository } from '@features/201-files/domain/repositories/workexp.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { WorkexpCompanyRepository } from '@features/201-files/domain/repositories/workexp-company.repository';
import { WorkExpJobTitleRepository } from '@features/201-files/domain/repositories/workexp-jobtitle.repository';
import { CreateWorkExpCommand } from '../../commands/workexp/create-workexp.command';
import { NotFoundException } from '@features/shared/exceptions/shared';
import { EmployeeRepository } from '@features/shared/domain/repositories/employee.repository';

@Injectable()
export class CreateWorkExpUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.WORKEXP)
    private readonly workExpRepository: WorkExpRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.WORKEXPCOMPANY)
    private readonly workexpCompanyRepository: WorkexpCompanyRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.WORKEXPJOBTITLE)
    private readonly workexpJobTitleRepository: WorkExpJobTitleRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EMPLOYEE)
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute(
    dto: CreateWorkExpCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<WorkExp> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_WORKEXP,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_WORKEXP,
          CONSTANTS_DATABASE_MODELS.WORKEXP,
          userId,
          dto,
          requestInfo,
          `Created new workexp: ${dto.employeeId}`,
          `Failed to create workexp: ${dto.employeeId}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // check if the employee exists
            const employee = await this.employeeRepository.findById(
              dto.employeeId,
              manager,
            );
            if (!employee) {
              throw new NotFoundException('Employee not found');
            }
            // find the company
            const company =
              await this.workexpCompanyRepository.findByDescription(
                dto.company,
                manager,
              );
            if (!company) {
              throw new NotFoundException('Company not found');
            }

            // find the job title
            const jobTitle =
              await this.workexpJobTitleRepository.findByDescription(
                dto.jobTitle!,
                manager,
              );
            if (!jobTitle) {
              throw new NotFoundException('Jobtitle not found');
            }

            // Create the workexp
            const workExp = await this.workExpRepository.create(
              new WorkExp({
                employeeId: dto.employeeId,
                years: dto.years,
                companyId: company.id,
                workexpJobTitleId: jobTitle.id,
              }),
              manager,
            );

            return workExp;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
