import { LeaveRequestRepository } from '@features/leave-management/domain/repositories/leave-request.repository';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_DATABASE_MODELS } from '@shared/constants/database.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { ErrorHandlerPort } from '@features/shared/ports/error-handler.port';
import {
  BadRequestException,
  NotFoundException,
} from '@features/shared/exceptions/shared';
import { EnumLeaveRequestStatus } from '@features/leave-management/domain/enum/leave-request-status.enum';

@Injectable()
export class RejectLeaveRequestUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_REQUEST)
    private readonly leaveRequestRepository: LeaveRequestRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.ERROR_HANDLER)
    private readonly errorHandler: ErrorHandlerPort,
  ) {}

  async execute(
    requestId: number,
    approverId: number,
    remarks: string,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.REJECT_LEAVE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.REJECT_LEAVE,
          CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST,
          userId,
          { requestId, approverId, remarks },
          requestInfo,
          `Rejected leave request with ID: ${requestId}`,
          `Failed to reject leave request with ID: ${requestId}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate remarks are provided
            if (!remarks || remarks.trim().length === 0) {
              throw new BadRequestException('Rejection remarks are required');
            }

            // Validate request exists and is PENDING
            const request = await this.leaveRequestRepository.findById(
              requestId,
              manager,
            );

            if (!request) {
              throw new NotFoundException('Leave request not found');
            }

            if (request.status !== EnumLeaveRequestStatus.PENDING) {
              throw new BadRequestException(
                `Cannot reject request. Current status: ${request.status}. Only PENDING requests can be rejected.`,
              );
            }

            // Update request status to REJECTED
            const updateSuccess =
              await this.leaveRequestRepository.updateStatus(
                requestId,
                EnumLeaveRequestStatus.REJECTED,
                approverId,
                remarks,
                manager,
              );

            if (!updateSuccess) {
              throw new BadRequestException('Failed to update request status');
            }

            // Note: Balance is NOT modified for rejected requests
            // No transaction created

            return true;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
