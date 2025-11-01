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
import { EduCourseLevelRepository } from '@features/201-files/domain/repositories/edu-courselevel.repository';
import { UpdateEduCourseLevelCommand } from '../../commands/edu-course-level/update-edu-course-level.command';
import { EduCourseLevel } from '@features/201-files/domain/models/edu-courselevel.model';

@Injectable()
export class UpdateEduCourseLevelUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDUCOURSELEVEL)
    private readonly educourselevelRepository: EduCourseLevelRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateEduCourseLevelCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<EduCourseLevel | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_EDUCOURSELEVEL,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_EDUCOURSELEVEL,
          CONSTANTS_DATABASE_MODELS.EDUCOURSELEVEL,
          userId,
          { id, dto },
          requestInfo,
          `Updated educourselevel: ${dto.desc1}`,
          `Failed to update educourselevel with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate educourselevel existence
            const educourselevelResult =
              await this.educourselevelRepository.findById(id, manager);
            if (!educourselevelResult) {
              throw new NotFoundException('EduCourselevel not found');
            }

            // Update the educourselevel
            const updateSuccessfull =
              await this.educourselevelRepository.update(
                id,
                new EduCourseLevel(dto),
                manager,
              );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException(
                'EduCourselevel update failed',
              );
            }

            // Retrieve the updated educourselevel
            const educourselevel = await this.educourselevelRepository.findById(
              id,
              manager,
            );

            return educourselevel!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
