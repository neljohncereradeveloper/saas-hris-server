import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { EduCourseRepository } from '@features/201-files/domain/repositories/edu-course.repository';
import { CreateEduCourseCommand } from '../../commands/edu-course/create-edu-course.command';
import { EduCourse } from '@features/201-files/domain/models/edu-course.model';

@Injectable()
export class CreateEduCourseUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.EDUCOURSE)
    private readonly educourseRepository: EduCourseRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateEduCourseCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<EduCourse> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_EDUCOURSE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_EDUCOURSE,
          CONSTANTS_DATABASE_MODELS.EDUCOURSE,
          userId,
          dto,
          requestInfo,
          `Created new educourse: ${dto.desc1}`,
          `Failed to create educourse: ${dto.desc1}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Create the educourse
            const educourse = await this.educourseRepository.create(
              new EduCourse(dto),
              manager,
            );

            return educourse;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
