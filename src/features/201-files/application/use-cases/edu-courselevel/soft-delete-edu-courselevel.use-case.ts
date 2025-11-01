import { EduCourseLevelRepository } from '@features/201-files/domain/repositories/edu-courselevel.repository';
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
export class SoftDeleteEduCourseLevelUseCase {
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
      CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUCOURSELEVEL,
      async (manager) => {
        const action = isActive ? 'activate' : 'deactivate';
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.SOFT_DELETE_EDUCOURSELEVEL,
          CONSTANTS_DATABASE_MODELS.EDUCOURSELEVEL,
          userId,
          { id, isActive },
          requestInfo,
          `Education course level has been ${action}d`,
          `Failed to ${action} education course level with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate educourselevel existence
            const educourselevel = await this.educourselevelRepository.findById(
              id,
              manager,
            );
            if (!educourselevel) {
              throw new NotFoundException('EduCourselevel not found');
            }

            // Soft delete the educourselevel
            const softDeleteSuccessfull =
              await this.educourselevelRepository.softDelete(
                id,
                isActive,
                manager,
              );
            if (!softDeleteSuccessfull) {
              throw new SomethinWentWrongException(
                'EduCourselevel soft delete failed',
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
