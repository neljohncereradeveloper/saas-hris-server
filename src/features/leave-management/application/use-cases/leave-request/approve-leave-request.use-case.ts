import { LeaveRequestRepository } from '@features/leave-management/domain/repositories/leave-request.repository';
import { LeaveBalanceRepository } from '@features/leave-management/domain/repositories/leave-balance.repository';
import { LeaveTransactionRepository } from '@features/leave-management/domain/repositories/leave-transaction.repository';
import { LeaveTransaction } from '@features/leave-management/domain/models/leave-transaction.model';
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
import { EnumLeaveTransactionType } from '@features/leave-management/domain/enum/leave-transaction-status.enum';
import { EnumLeaveBalanceStatus } from '@features/leave-management/domain/enum/leave-balance-status.enum';

@Injectable()
export class ApproveLeaveRequestUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_REQUEST)
    private readonly leaveRequestRepository: LeaveRequestRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_BALANCE)
    private readonly leaveBalanceRepository: LeaveBalanceRepository,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_TRANSACTION)
    private readonly leaveTransactionRepository: LeaveTransactionRepository,
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
      CONSTANTS_LOG_ACTION.APPROVE_LEAVE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.APPROVE_LEAVE,
          CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST,
          userId,
          { requestId, approverId, remarks },
          requestInfo,
          `Approved leave request with ID: ${requestId}`,
          `Failed to approve leave request with ID: ${requestId}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
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
                `Cannot approve request. Current status: ${request.status}. Only PENDING requests can be approved.`,
              );
            }

            // Re-validate balance (may have changed since request creation)
            const balance = await this.leaveBalanceRepository.findById(
              request.balanceId,
              manager,
            );

            if (!balance) {
              throw new NotFoundException('Leave balance not found');
            }

            if (balance.status !== EnumLeaveBalanceStatus.OPEN) {
              throw new BadRequestException(
                'Cannot approve request. Balance is closed.',
              );
            }

            if (balance.remaining < request.totalDays) {
              throw new BadRequestException(
                `Insufficient balance. Available: ${balance.remaining} days, Requested: ${request.totalDays} days`,
              );
            }

            // Update request status to APPROVED
            const updateSuccess =
              await this.leaveRequestRepository.updateStatus(
                requestId,
                EnumLeaveRequestStatus.APPROVED,
                approverId,
                remarks || '',
                manager,
              );

            if (!updateSuccess) {
              throw new BadRequestException('Failed to update request status');
            }

            // Update balance: deduct used days
            const newUsed = balance.used + request.totalDays;
            const newRemaining = balance.remaining - request.totalDays;

            const balanceUpdateSuccess =
              await this.leaveBalanceRepository.update(
                balance.id!,
                {
                  used: newUsed,
                  remaining: newRemaining,
                  lastTransactionDate: new Date(),
                },
                manager,
              );

            if (!balanceUpdateSuccess) {
              throw new BadRequestException('Failed to update leave balance');
            }

            // Create transaction record
            await this.leaveTransactionRepository.create(
              new LeaveTransaction({
                balanceId: balance.id!,
                transactionType: EnumLeaveTransactionType.REQUEST,
                days: -request.totalDays,
                remarks: `Leave request approved - ${request.totalDays} days from ${request.startDate.toISOString().split('T')[0]} to ${request.endDate.toISOString().split('T')[0]}`,
                isActive: true,
              }),
              manager,
            );

            return true;
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }
}
