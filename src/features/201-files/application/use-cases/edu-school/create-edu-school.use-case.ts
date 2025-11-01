import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { EduSchoolRepository } from '@features/201-files/domain/repositories/edu-school.repository';
import { CreateEduSchoolCommand } from '../../commands/edu-school/create-edu-school.command';
import { EduSchool } from '@features/201-files/domain/models/edu-school.model';

@Injectable()
export class CreateEduSchoolUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDUSCHOOL)
    private readonly eduschoolRepository: EduSchoolRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateEduSchoolCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<EduSchool> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_EDUSCHOOL,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_EDUSCHOOL,
          CONSTANTS_DATABASE_MODELS.EDUSCHOOL,
          userId,
          dto,
          requestInfo,
          `Created new eduschool: ${dto.desc1}`,
          `Failed to create eduschool: ${dto.desc1}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Create the eduschool
            const eduschool = await this.eduschoolRepository.create(
              new EduSchool(dto),
              manager,
            );

            return eduschool;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
