import { EduCourseRepository } from '@features/201-files/domain/repositories/edu-course.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import {
  NotFoundException,
  SomethinWentWrongException,
} from '@features/shared/exceptions/shared';

@Injectable()
export class SoftDeleteEduCourseUseCase {
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
    isActive: boolean,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUCOURSE,
      async (manager) => {
        const action = isActive ? 'activate' : 'deactivate';
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUCOURSE,
          CONSTANTS_DATABASE_MODELS.EDUCOURSE,
          userId,
          { id, isActive },
          requestInfo,
          `Education course has been ${action}d`,
          `Failed to ${action} education course with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate educourse existence
            const educourse = await this.eduCourseRepository.findById(
              id,
              manager,
            );
            if (!educourse) {
              throw new NotFoundException('EduCourse not found');
            }

            // Soft delete the educourse
            const softDeleteSuccessfull =
              await this.eduCourseRepository.softDelete(id, isActive, manager);
            if (!softDeleteSuccessfull) {
              throw new SomethinWentWrongException(
                'EduCourse soft delete failed',
              );
            }

            return softDeleteSuccessfull;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
