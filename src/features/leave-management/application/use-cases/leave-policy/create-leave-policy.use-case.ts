import { LeavePolicy } from '@features/leave-management/domain/models/leave-policy.model';
import { LeavePolicyRepository } from '@features/leave-management/domain/repositories/leave-policy.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CreateLeavePolicyCommand } from '@features/leave-management/application/commands/leave-policy/create-leave-policy.command';
import { LeaveTypeRepository } from '@features/leave-management/domain/repositories/leave-type.repository';
import { NotFoundException } from '@features/shared/exceptions/shared';

@Injectable()
export class CreateLeavePolicyUseCase {
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
    dto: CreateLeavePolicyCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<LeavePolicy> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_LEAVE_POLICY,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_LEAVE_POLICY,
          CONSTANTS_DATABASE_MODELS.LEAVE_POLICY,
          userId,
          dto,
          requestInfo,
          `Created new leave policy for leave type: ${dto.leaveType}`,
          `Failed to create leave policy for leave type: ${dto.leaveType}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate leave type existence
            const leaveType = await this.leaveTypeRepository.findByName(
              dto.leaveType,
              manager,
            );
            if (!leaveType) {
              throw new NotFoundException('Leave type not found');
            }

            // Create the leave policy
            const leavePolicy = await this.leavePolicyRepository.create(
              new LeavePolicy({
                ...dto,
                leaveTypeId: leaveType.id!,
                leaveType: leaveType.name,
                status: 'draft' as any, // Will be set to draft initially
              }),
              manager,
            );

            return leavePolicy;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
