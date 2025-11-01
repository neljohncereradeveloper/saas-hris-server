import { LeaveType } from '@features/leave-management/domain/models/leave-type.model';
import { LeaveTypeRepository } from '@features/leave-management/domain/repositories/leave-type.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import { CreateLeaveTypeCommand } from '@features/leave-management/application/commands/leave-type/create-leave-type.command';

@Injectable()
export class CreateLeaveTypeUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_TYPE)
    private readonly leaveTypeRepository: LeaveTypeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    dto: CreateLeaveTypeCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<LeaveType> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CREATE_LEAVE_TYPE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CREATE_LEAVE_TYPE,
          CONSTANTS_DATABASE_MODELS.LEAVE_TYPE,
          userId,
          dto,
          requestInfo,
          `Created new leave type: ${dto.name}`,
          `Failed to create leave type: ${dto.name}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Create the leave type
            const leaveType = await this.leaveTypeRepository.create(
              new LeaveType(dto),
              manager,
            );

            return leaveType;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
