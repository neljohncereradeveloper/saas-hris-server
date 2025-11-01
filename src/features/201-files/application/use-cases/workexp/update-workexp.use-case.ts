import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import {
  SomethinWentWrongException,
  NotFoundException,
} from '@features/shared/exceptions/shared';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { WorkExpRepository } from '@features/201-files/domain/repositories/workexp.repository';
import { WorkexpCompanyRepository } from '@features/201-files/domain/repositories/workexp-company.repository';
import { WorkExpJobTitleRepository } from '@features/201-files/domain/repositories/workexp-jobtitle.repository';
import { UpdateWorkExpCommand } from '../../commands/workexp/update-workexp.command';
import { WorkExp } from '@features/201-files/domain/models/workexp.model';

@Injectable()
export class UpdateWorkExpUseCase {
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
  ) {}

  async execute(
    id: number,
    dto: UpdateWorkExpCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<WorkExp | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_WORKEXP,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_WORKEXP,
          CONSTANTS_DATABASE_MODELS.WORKEXP,
          userId,
          { id, dto },
          requestInfo,
          `Updated workexp: ${dto.company}`,
          `Failed to update workexp with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate workExperience existence
            const workExperienceResult = await this.workExpRepository.findById(
              id,
              manager,
            );
            if (!workExperienceResult) {
              throw new NotFoundException('WorkExperience not found');
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
              throw new NotFoundException('Job title not found');
            }

            // Update the workexp
            const updateSuccessfull = await this.workExpRepository.update(
              id,
              new WorkExp({
                ...workExperienceResult,
                companyId: company.id,
                workexpJobTitleId: jobTitle.id,
                years: dto.years,
              }),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('Workexp update failed');
            }

            // Retrieve the updated workexp
            const workExp = await this.workExpRepository.findById(id, manager);

            return workExp!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
