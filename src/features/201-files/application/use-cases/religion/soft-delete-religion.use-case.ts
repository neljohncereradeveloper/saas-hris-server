import { ReligionRepository } from '@features/201-files/domain/repositories/religion.repository';
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
export class SoftDeleteReligionUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.RELIGION)
    private readonly religionRepository: ReligionRepository,
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
      CONSTANTS_LOG_ACTION.SOFT_DELETE_RELIGION,
      async (manager) => {
        const action = isActive ? 'activate' : 'deactivate';
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.SOFT_DELETE_RELIGION,
          CONSTANTS_DATABASE_MODELS.RELIGION,
          userId,
          { id, isActive },
          requestInfo,
          `Religion has been ${action}d`,
          `Failed to ${action} religion with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate religion existence
            const religion = await this.religionRepository.findById(
              id,
              manager,
            );
            if (!religion) {
              throw new NotFoundException('Religion not found');
            }

            // Soft delete the religion
            const softDeleteSuccessfull =
              await this.religionRepository.softDelete(id, isActive, manager);
            if (!softDeleteSuccessfull) {
              throw new SomethinWentWrongException(
                'Religion soft delete failed',
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
