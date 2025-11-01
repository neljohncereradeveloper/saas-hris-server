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
import { EduCourseRepository } from '@features/201-files/domain/repositories/edu-course.repository';
import { UpdateEduCourseCommand } from '@features/201-files/application/commands/edu-course/update-edu-course.command';
import { EduCourse } from '@features/201-files/domain/models/edu-course.model';

@Injectable()
export class UpdateEduCourseUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDUCOURSE)
    private readonly eduCourseRepository: EduCourseRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateEduCourseCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<EduCourse | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_EDUCOURSE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_EDUCOURSE,
          CONSTANTS_DATABASE_MODELS.EDUCOURSE,
          userId,
          { id, dto },
          requestInfo,
          `Updated educourse: ${dto.desc1}`,
          `Failed to update educourse with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate educourse existence
            const educourseResult = await this.eduCourseRepository.findById(
              id,
              manager,
            );
            if (!educourseResult) {
              throw new NotFoundException('EduCourse not found');
            }

            // Update the educourse
            const updateSuccessfull = await this.eduCourseRepository.update(
              id,
              new EduCourse(dto),
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('EduCourse update failed');
            }

            // Retrieve the updated educourse
            const educourse = await this.eduCourseRepository.findById(
              id,
              manager,
            );

            return educourse!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
