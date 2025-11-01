import { LeaveCycleRepository } from '@features/leave-management/domain/repositories/leave-cycle.repository';
import { LeaveCycle } from '@features/leave-management/domain/models/leave-cycle.model';
import { Inject, Injectable } from '@nestjs/common';
import { CONSTANTS_REPOSITORY_TOKENS } from '@shared/constants/tokens.constants';
import { CONSTANTS_LOG_ACTION } from '@shared/constants/log-action.constants';
import { TransactionPort } from '@features/shared/ports/transaction-port';
import { NotFoundException } from '@features/shared/exceptions/shared';

@Injectable()
export class GetActiveCycleUseCase {
  constructor(
    @Inject(CONSTANTS_REPOSITORY_TOKENS.TRANSACTIONPORT)
    private readonly transactionHelper: TransactionPort,
    @Inject(CONSTANTS_REPOSITORY_TOKENS.LEAVE_CYCLE)
    private readonly leaveCycleRepository: LeaveCycleRepository,
  ) {}

  async execute(employeeId: number, leaveTypeId: number): Promise<LeaveCycle> {
    return this.transactionHelper.executeTransaction(
      CONSTANTS_LOG_ACTION.FIND_LEAVE_CYCLE_BY_ID,
      async (manager) => {
        const cycle = await this.leaveCycleRepository.getActiveCycle(
          employeeId,
          leaveTypeId,
          manager,
        );

        if (!cycle) {
          throw new NotFoundException(
            `No active cycle found for employee ${employeeId} and leave type ${leaveTypeId}`,
          );
        }

        return cycle;
      },
    );
  }
}
