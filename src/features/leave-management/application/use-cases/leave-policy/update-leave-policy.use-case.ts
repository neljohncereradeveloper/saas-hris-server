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
import { UpdateLeavePolicyCommand } from '@features/leave-management/application/commands/leave-policy/update-leave-policy.command';
import { LeavePolicy } from '@features/leave-management/domain/models/leave-policy.model';
import { LeavePolicyRepository } from '@features/leave-management/domain/repositories/leave-policy.repository';
import { LeaveTypeRepository } from '@features/leave-management/domain/repositories/leave-type.repository';

@Injectable()
export class UpdateLeavePolicyUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_POLICY)
    private readonly leavePolicyRepository: LeavePolicyRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_TYPE)
    private readonly leaveTypeRepository: LeaveTypeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateLeavePolicyCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<LeavePolicy | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_LEAVE_POLICY,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_LEAVE_POLICY,
          CONSTANTS_DATABASE_MODELS.LEAVE_POLICY,
          userId,
          { id, dto },
          requestInfo,
          `Updated leave policy with ID: ${id}`,
          `Failed to update leave policy with ID: ${id}`,
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

            // Validate leave type existence
            const leaveType = await this.leaveTypeRepository.findByName(
              dto.leaveType!,
              manager,
            );
            if (!leaveType) {
              throw new NotFoundException('Leave type not found');
            }

            // Update the leave policy
            const updateSuccessfull = await this.leavePolicyRepository.update(
              id,
              {
                ...dto,
                leaveTypeId: leaveType.id!,
                leaveType: leaveType.name,
              },
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException(
                'Leave policy update failed',
              );
            }

            // Retrieve the updated leave policy
            const leavePolicy = await this.leavePolicyRepository.findById(
              id,
              manager,
            );

            return leavePolicy!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
