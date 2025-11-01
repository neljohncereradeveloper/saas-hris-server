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
import { LeavePolicyRepository } from '@features/leave-management/domain/repositories/leave-policy.repository';

@Injectable()
export class SoftDeleteLeavePolicyUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_POLICY)
    private readonly leavePolicyRepository: LeavePolicyRepository,
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
      CONSTANTS_LOG_ACTION.SOFT_DELETE_LEAVE_POLICY,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.SOFT_DELETE_LEAVE_POLICY,
          CONSTANTS_DATABASE_MODELS.LEAVE_POLICY,
          userId,
          { id, isActive },
          requestInfo,
          `Soft deleted leave policy with ID: ${id}`,
          `Failed to soft delete leave policy with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate leave policy existence
            const leavePolicyResult = await this.leavePolicyRepository.findById(
              id,
              manager,
            );

            if (!leavePolicyResult) {
              throw new NotFoundException('Leave policy not found');
            }

            // Soft delete the leave policy
            const deleteSuccessfull =
              await this.leavePolicyRepository.softDelete(
                id,
                isActive,
                manager,
              );
            if (!deleteSuccessfull) {
              throw new SomethinWentWrongException(
                'Leave policy soft delete failed',
              );
            }

            return true;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
