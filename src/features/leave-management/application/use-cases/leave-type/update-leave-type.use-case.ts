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
import { UpdateLeaveTypeCommand } from '@features/leave-management/application/commands/leave-type/update-leave-type.command';
import { LeaveType } from '@features/leave-management/domain/models/leave-type.model';
import { LeaveTypeRepository } from '@features/leave-management/domain/repositories/leave-type.repository';

@Injectable()
export class UpdateLeaveTypeUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_TYPE)
    private readonly leaveTypeRepository: LeaveTypeRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    id: number,
    dto: UpdateLeaveTypeCommand,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<LeaveType | null> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.UPDATE_LEAVE_TYPE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.UPDATE_LEAVE_TYPE,
          CONSTANTS_DATABASE_MODELS.LEAVE_TYPE,
          userId,
          { id, dto },
          requestInfo,
          `Updated leave type: ${dto.name}`,
          `Failed to update leave type with ID: ${id}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // validate leave type existence
            const leaveTypeResult = await this.leaveTypeRepository.findById(
              id,
              manager,
            );

            if (!leaveTypeResult) {
              throw new NotFoundException('Leave type not found');
            }

            // Update the leave type
            const updateSuccessfull = await this.leaveTypeRepository.update(
              id,
              dto,
              manager,
            );
            if (!updateSuccessfull) {
              throw new SomethinWentWrongException('Leave type update failed');
            }

            // Retrieve the updated leave type
            const leaveType = await this.leaveTypeRepository.findById(
              id,
              manager,
            );

            return leaveType!;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
