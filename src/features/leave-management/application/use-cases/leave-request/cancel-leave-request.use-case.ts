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
export class CancelLeaveRequestUseCase {
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
    employeeId: number,
    userId: string,
    requestInfo?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      username?: string;
    },
  ): Promise<boolean> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.CANCEL_LEAVE,
      async (manager) => {
        const errorHandlerOptions = this.errorHandler.createOptions(
          CONSTANTS_LOG_ACTION.CANCEL_LEAVE,
          CONSTANTS_DATABASE_MODELS.LEAVE_REQUEST,
          userId,
          { requestId, employeeId },
          requestInfo,
          `Cancelled leave request with ID: ${requestId}`,
          `Failed to cancel leave request with ID: ${requestId}`,
        );

        return this.errorHandler.executeWithErrorHandling(
          async () => {
            // Validate request exists
            const request = await this.leaveRequestRepository.findById(
              requestId,
              manager,
            );

            if (!request) {
              throw new NotFoundException('Leave request not found');
            }

            // Validate employee owns the request
            if (request.employeeId !== employeeId) {
              throw new BadRequestException(
                'Cannot cancel request. Employee does not own this request.',
              );
            }

            // Handle different cancellation scenarios
            if (request.status === EnumLeaveRequestStatus.PENDING) {
              // Scenario E1: Cancel PENDING request (no balance impact)
              return await this.cancelPendingRequest(requestId, manager);
            } else if (request.status === EnumLeaveRequestStatus.APPROVED) {
              // Scenario E2: Cancel APPROVED request (restore balance)
              return await this.cancelApprovedRequest(request, manager);
            } else {
              throw new BadRequestException(
                `Cannot cancel request. Current status: ${request.status}. Only PENDING or APPROVED requests can be cancelled.`,
              );
            }
          },
          errorHandlerOptions,
          manager,
        );
      },
    );
  }

  /**
   * Cancel PENDING request (no balance impact)
   */
  private async cancelPendingRequest(
    requestId: number,
    manager: unknown,
  ): Promise<boolean> {
    const updateSuccess = await this.leaveRequestRepository.updateStatus(
      requestId,
      EnumLeaveRequestStatus.CANCELLED,
      0,
      'Cancelled by employee',
      manager,
    );

    if (!updateSuccess) {
      throw new BadRequestException('Failed to cancel request');
    }

    // No balance update needed
    // No transaction created

    return true;
  }

  /**
   * Cancel APPROVED request (restore balance)
   */
  private async cancelApprovedRequest(
    request: any,
    manager: unknown,
  ): Promise<boolean> {
    // Get balance
    const balance = await this.leaveBalanceRepository.findById(
      request.balanceId,
      manager,
    );

    if (!balance) {
      throw new NotFoundException('Leave balance not found');
    }

    if (balance.status !== EnumLeaveBalanceStatus.OPEN) {
      throw new BadRequestException(
        'Cannot cancel approved request. Balance is closed.',
      );
    }

    // Update request status to CANCELLED
    const updateSuccess = await this.leaveRequestRepository.updateStatus(
      request.id!,
      EnumLeaveRequestStatus.CANCELLED,
      0,
      'Cancelled by employee - balance restored',
      manager,
    );

    if (!updateSuccess) {
      throw new BadRequestException('Failed to cancel request');
    }

    // Restore balance: reverse deduction
    const newUsed = balance.used - request.totalDays;
    const newRemaining = balance.remaining + request.totalDays;

    const balanceUpdateSuccess = await this.leaveBalanceRepository.update(
      balance.id!,
      {
        used: newUsed,
        remaining: newRemaining,
        lastTransactionDate: new Date(),
      },
      manager,
    );

    if (!balanceUpdateSuccess) {
      throw new BadRequestException('Failed to restore leave balance');
    }

    // Create reversal transaction
    await this.leaveTransactionRepository.create(
      new LeaveTransaction({
        balanceId: balance.id!,
        transactionType: EnumLeaveTransactionType.REQUEST,
        days: +request.totalDays, // Positive, restoration
        remarks: `Leave request cancelled - ${request.totalDays} days restored`,
        isActive: true,
      }),
      manager,
    );

    return true;
  }
}
