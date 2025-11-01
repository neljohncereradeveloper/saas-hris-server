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
import { EduSchoolRepository } from '@features/201-files/domain/repositories/edu-school.repository';
import { UpdateEduSchoolCommand } from '../../commands/edu-school/update-edu-school.command';
import { EduSchool } from '@features/201-files/domain/models/edu-school.model';

@Injectable()
export class UpdateEduSchoolUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDUSCHOOL)
    private readonly eduschoolRepository: EduSchoolRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateEduSchoolCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<EduSchool | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_EDUSCHOOL,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_EDUSCHOOL,
          CONSTANTS_DATABASE_MODELS.EDUSCHOOL,
          userId,
          { id, dto },
          requestInfo,
          `Updated eduschool: ${dto.desc1}`,
          `Failed to update eduschool with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate eduschool existence
            const eduschoolResult = await this.eduschoolRepository.findById(
              id,
              manager,
            );
            if (!eduschoolResult) {
              throw new NotFoundException('EduSchool not found');
            }

            // Update the eduschool
            const updateSuccessfull = await this.eduschoolRepository.update(
              id,
              new EduSchool(dto),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('EduSchool update failed');
            }

            // Retrieve the updated eduschool
            const eduschool = await this.eduschoolRepository.findById(
              id,
              manager,
            );

            return eduschool!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
